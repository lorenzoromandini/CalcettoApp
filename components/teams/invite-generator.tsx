'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { generateInviteLink } from '@/lib/actions/invites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Link2, Copy, Check, Share2, MessageCircle } from 'lucide-react';

interface InviteGeneratorProps {
  teamId: string;
}

export function InviteGenerator({ teamId }: InviteGeneratorProps) {
  const t = useTranslations('invites');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState(50);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { link } = await generateInviteLink(teamId, { maxUses });
      setInviteLink(link);
    } catch (error) {
      console.error('Failed to generate invite:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!inviteLink) return;
    const text = encodeURIComponent(`${t('whatsapp.message')} ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    if (!inviteLink) return;
    const subject = encodeURIComponent(t('email.subject'));
    const body = encodeURIComponent(`${t('email.body')}\n\n${inviteLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          {t('generator.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!inviteLink ? (
          <>
            <div className="space-y-3">
              <Label>{t('generator.maxUses')}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[maxUses]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={([v]: number[]) => setMaxUses(v)}
                  className="flex-1"
                />
                <span className="w-12 text-right font-medium">{maxUses}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('generator.maxUsesHint')}
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12"
            >
              {isGenerating ? t('generator.generating') : t('generator.button')}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('generator.linkLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1 h-12"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12"
                onClick={handleShareWhatsApp}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={handleShareEmail}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t('generator.email')}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setInviteLink(null)}
            >
              {t('generator.createNew')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
