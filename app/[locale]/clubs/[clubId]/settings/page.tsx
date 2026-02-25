'use client';
'use no memo';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Settings, Trash2, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/components/providers/session-provider';
import { authFetch } from '@/lib/auth-fetch';
import { ClubImageUploader } from '@/components/clubs/club-image-uploader';
import { useClub, useDeleteClub } from '@/hooks/use-clubs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ClubSettingsPage() {
  const t = useTranslations('settings');
  const tClubs = useTranslations('clubs');
  const params = useParams();
  const router = useRouter();
  const clubId = params.clubId as string;
  const locale = params.locale as string;

  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();
  const { club, refetch } = useClub(clubId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteClub, isPending: isDeleting } = useDeleteClub();

  const checkAdminStatus = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await authFetch(`/api/clubs/${clubId}/admin`);
      const data = await res.json();
      setIsOwner(data.isOwner);
    } catch {
      setIsOwner(false);
    }
    
    setIsLoading(false);
  }, [clubId, session]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      setImageUrl(club.imageUrl || undefined);
    }
  }, [club]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await authFetch(`/api/clubs/${clubId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          image_url: imageUrl || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSaveSuccess(true);
      refetch();
    } catch (error) {
      console.error('Failed to save club settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClub(clubId);
      router.push(`/${locale}/clubs`);
    } catch (error) {
      console.error('Failed to delete club:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/${locale}/clubs/${clubId}`}>
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToClub')}
            </Button>
          </Link>
        </div>
        <p className="text-center text-muted-foreground">{t('notAdmin')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/${locale}/clubs/${clubId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToClub')}
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t('title')}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('clubInfo.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{tClubs('form.image')}</Label>
              <ClubImageUploader
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t('clubInfo.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tClubs('form.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('clubInfo.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={tClubs('form.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('save')}
                </>
              )}
            </Button>

            {saveSuccess && (
              <p className="text-sm text-green-600 text-center">{t('saveSuccess')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t('dangerZone.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('dangerZone.description')}
            </p>
            <Button 
              variant="destructive" 
              className="h-12"
              onClick={() => setShowDeleteDialog(true)}
            >
              {t('dangerZone.deleteClub')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog di conferma eliminazione */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dangerZone.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('dangerZone.deleteConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                t('dangerZone.confirmDelete')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
