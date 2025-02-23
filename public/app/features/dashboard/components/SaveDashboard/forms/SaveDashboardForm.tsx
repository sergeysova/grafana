import React, { useMemo, useState } from 'react';

import { selectors } from '@grafana/e2e-selectors';
import { Button, Checkbox, Form, Stack, TextArea } from '@grafana/ui';
import { DashboardModel } from 'app/features/dashboard/state';

import { SaveDashboardData, SaveDashboardOptions } from '../types';

interface FormDTO {
  message: string;
}

type Props = {
  dashboard: DashboardModel; // original
  saveModel: SaveDashboardData; // already cloned
  onCancel: () => void;
  onSuccess: () => void;
  onSubmit?: (clone: any, options: SaveDashboardOptions, dashboard: DashboardModel) => Promise<any>;
  options: SaveDashboardOptions;
  onOptionsChange: (opts: SaveDashboardOptions) => void;
};

export const SaveDashboardForm = ({
  dashboard,
  saveModel,
  options,
  onSubmit,
  onCancel,
  onSuccess,
  onOptionsChange,
}: Props) => {
  const hasTimeChanged = useMemo(() => dashboard.hasTimeChanged(), [dashboard]);
  const hasVariableChanged = useMemo(() => dashboard.hasVariableValuesChanged(), [dashboard]);

  const [saving, setSaving] = useState(false);

  return (
    <Form
      onSubmit={async (data: FormDTO) => {
        if (!onSubmit) {
          return;
        }
        setSaving(true);
        options = { ...options, message: data.message };
        const result = await onSubmit(saveModel.clone, options, dashboard);
        if (result.status === 'success') {
          if (options.saveVariables) {
            dashboard.resetOriginalVariables();
          }
          if (options.saveTimerange) {
            dashboard.resetOriginalTime();
          }
          onSuccess();
        } else {
          setSaving(false);
        }
      }}
    >
      {({ register, errors }) => (
        <Stack direction="column" gap={2}>
          {hasTimeChanged && (
            <Checkbox
              checked={!!options.saveTimerange}
              onChange={() =>
                onOptionsChange({
                  ...options,
                  saveTimerange: !options.saveTimerange,
                })
              }
              label="Save current time range as dashboard default"
              aria-label={selectors.pages.SaveDashboardModal.saveTimerange}
            />
          )}
          {hasVariableChanged && (
            <Checkbox
              checked={!!options.saveVariables}
              onChange={() =>
                onOptionsChange({
                  ...options,
                  saveVariables: !options.saveVariables,
                })
              }
              label="Save current variable values as dashboard default"
              aria-label={selectors.pages.SaveDashboardModal.saveVariables}
            />
          )}

          <TextArea {...register('message')} placeholder="Add a note to describe your changes." autoFocus rows={5} />

          <Stack alignItems="center">
            <Button variant="secondary" onClick={onCancel} fill="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!saveModel.hasChanges}
              icon={saving ? 'fa fa-spinner' : undefined}
              aria-label={selectors.pages.SaveDashboardModal.save}
            >
              Save
            </Button>
            {!saveModel.hasChanges && <div>No changes to save</div>}
          </Stack>
        </Stack>
      )}
    </Form>
  );
};
