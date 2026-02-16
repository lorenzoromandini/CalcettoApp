'use client';

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormationMode, getFormationPresets } from '@/lib/formations';

interface FormationSelectorProps {
  mode: FormationMode;
  currentFormation: string;
  onChange: (presetId: string) => void;
  disabled?: boolean;
}

export function FormationSelector({
  mode,
  currentFormation,
  onChange,
  disabled,
}: FormationSelectorProps) {
  const t = useTranslations('formations');
  const presets = getFormationPresets(mode);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {t('selectFormation')}
      </label>
      <Select
        value={currentFormation}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full h-12">
          <SelectValue placeholder={t('selectFormation')} />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
