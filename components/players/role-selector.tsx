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
  primaryRole: PlayerRole | null;
  otherRoles: PlayerRole[];
  onPrimaryRoleChange: (role: PlayerRole) => void;
  onOtherRolesChange: (roles: PlayerRole[]) => void;
  disabled?: boolean;
}

export function RoleSelector({
  primaryRole,
  otherRoles,
  onPrimaryRoleChange,
  onOtherRolesChange,
  disabled,
}: RoleSelectorProps) {
  const t = useTranslations('players');

  const toggleOtherRole = (roleId: PlayerRole) => {
    if (disabled) return;

    // Cannot select primary role as other role
    if (roleId === primaryRole) return;

    if (otherRoles.includes(roleId)) {
      onOtherRolesChange(otherRoles.filter((r) => r !== roleId));
    } else {
      onOtherRolesChange([...otherRoles, roleId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Role - Single Select (Required) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t('form.primaryRole')} <span className="text-destructive">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(({ id, icon: Icon, translationKey }) => (
            <Toggle
              key={`primary-${id}`}
              pressed={primaryRole === id}
              onPressedChange={() => !disabled && onPrimaryRoleChange(id)}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 h-12 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              aria-label={t(translationKey)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{t(translationKey)}</span>
            </Toggle>
          ))}
        </div>
      </div>

      {/* Other Roles - Multi Select (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          {t('form.otherRoles')}
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(({ id, icon: Icon, translationKey }) => (
            <Toggle
              key={`other-${id}`}
              pressed={otherRoles.includes(id)}
              onPressedChange={() => toggleOtherRole(id)}
              disabled={disabled || primaryRole === id}
              className="flex items-center gap-2 px-4 py-2 h-12 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground disabled:opacity-50"
              aria-label={t(translationKey)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{t(translationKey)}</span>
            </Toggle>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('form.otherRolesHint')}
        </p>
      </div>
    </div>
  );
}

// Legacy support: Export a wrapper that converts between old and new props
interface LegacyRoleSelectorProps {
  value: PlayerRole[];
  onChange: (roles: PlayerRole[]) => void;
  disabled?: boolean;
}

/**
 * Legacy wrapper for backward compatibility
 * Converts between array format (roles[0] = primary, roles[1:] = others)
 * and the new separated props
 */
export function LegacyRoleSelector({ value, onChange, disabled }: LegacyRoleSelectorProps) {
  const primaryRole = value[0] || null;
  const otherRoles = value.slice(1);

  const handlePrimaryRoleChange = (role: PlayerRole) => {
    // New primary role + existing other roles (excluding new primary if it was in others)
    const newOtherRoles = otherRoles.filter(r => r !== role);
    onChange([role, ...newOtherRoles]);
  };

  const handleOtherRolesChange = (roles: PlayerRole[]) => {
    // Keep primary role, update others
    if (primaryRole) {
      onChange([primaryRole, ...roles]);
    }
  };

  return (
    <RoleSelector
      primaryRole={primaryRole}
      otherRoles={otherRoles}
      onPrimaryRoleChange={handlePrimaryRoleChange}
      onOtherRolesChange={handleOtherRolesChange}
      disabled={disabled}
    />
  );
}
