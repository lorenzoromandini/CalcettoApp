'use client';

import { useTranslations } from 'next-intl';
import { Toggle } from '@/components/ui/toggle';
import { Shield, UserCircle, Zap, Target } from 'lucide-react';
import type { PlayerRole } from '@/lib/db/schema';

const ROLES: { id: PlayerRole; icon: typeof Shield; translationKey: string }[] = [
  { id: 'goalkeeper', icon: Shield, translationKey: 'roles.goalkeeper' },
  { id: 'defender', icon: UserCircle, translationKey: 'roles.defender' },
  { id: 'midfielder', icon: Zap, translationKey: 'roles.midfielder' },
  { id: 'attacker', icon: Target, translationKey: 'roles.attacker' },
];

interface RoleSelectorProps {
  value: PlayerRole[];
  onChange: (roles: PlayerRole[]) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  const t = useTranslations('players');

  const toggleRole = (roleId: PlayerRole) => {
    if (disabled) return;

    if (value.includes(roleId)) {
      onChange(value.filter((r) => r !== roleId));
    } else {
      onChange([...value, roleId]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('form.roles')}</label>
      <div className="flex flex-wrap gap-2">
        {ROLES.map(({ id, icon: Icon, translationKey }) => (
          <Toggle
            key={id}
            pressed={value.includes(id)}
            onPressedChange={() => toggleRole(id)}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 h-12 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            aria-label={t(translationKey)}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{t(translationKey)}</span>
          </Toggle>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t('form.rolesHint')}
      </p>
    </div>
  );
}
