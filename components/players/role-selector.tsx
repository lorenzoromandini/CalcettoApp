'use client';

import { useTranslations } from 'next-intl';
import { Toggle } from '@/components/ui/toggle';
import { Hand, Shield, Zap, Target, Activity } from 'lucide-react';
import { PlayerRole } from '@prisma/client';

const ROLES: { id: PlayerRole; icon: typeof Shield; translationKey: string }[] = [
  { id: PlayerRole.POR, icon: Hand, translationKey: 'roles.goalkeeper' },
  { id: PlayerRole.DIF, icon: Shield, translationKey: 'roles.defender' },
  { id: PlayerRole.CEN, icon: Activity, translationKey: 'roles.midfielder' },
  { id: PlayerRole.ATT, icon: Target, translationKey: 'roles.attacker' },
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
    <div className="space-y-6">
      {/* Primary Role - Single Select (Required) */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          {t('form.primaryRole')} <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ id, icon: Icon, translationKey }) => {
            const isSelected = primaryRole === id;
            const isDisabled = disabled;
            
            return (
              <button
                key={`primary-${id}`}
                type="button"
                onClick={() => !isDisabled && onPrimaryRoleChange(id)}
                disabled={isDisabled}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{t(translationKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-border my-4"></div>

      {/* Other Roles - Multi Select (Optional) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          {t('form.otherRoles')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ id, icon: Icon, translationKey }) => {
            const isSelected = otherRoles.includes(id);
            const isDisabled = disabled || primaryRole === id;
            
            return (
              <button
                key={`other-${id}`}
                type="button"
                onClick={() => !isDisabled && toggleOtherRole(id)}
                disabled={isDisabled}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{t(translationKey)}</span>
              </button>
            );
          })}
        </div>
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
