'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

type Project = Tables<'projects'>;

interface ProjectSettingsFormProps {
  project: Project;
  maskedBotToken: string;
  updateAction: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
}

export function ProjectSettingsForm({
  project,
  maskedBotToken,
  updateAction,
}: ProjectSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showFullToken, setShowFullToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const displayToken = showFullToken ? project.telegram_bot_token : maskedBotToken;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set('projectId', project.id);

      const result = await updateAction(formData);

      if (result.success) {
        setSuccess(result.message || 'Project updated successfully');
        // Refresh the page to show updated data
        router.refresh();
      } else {
        setError(result.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={project.name}
          placeholder="Your shop or business name"
          required
          disabled={isLoading}
        />
        <p className="text-muted-foreground text-sm">
          This is the display name for your shop or business.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={project.description || ''}
          placeholder="Describe your shop or business (optional)"
          rows={3}
          disabled={isLoading}
        />
        <p className="text-muted-foreground text-sm">
          Optional description to help you and your team understand the project.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telegram_bot_token">Telegram Bot Token</Label>
        <div className="relative">
          <Input
            id="telegram_bot_token_display"
            name="telegram_bot_token_display"
            type={showFullToken ? 'text' : 'password'}
            value={displayToken || ''}
            onChange={() => {}} // Read-only display
            placeholder="123456789:AAEhBOweik6ad..."
            readOnly
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowFullToken(!showFullToken)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            disabled={isLoading}
          >
            {showFullToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2">
          <Label htmlFor="new_telegram_bot_token" className="text-sm">
            Update Bot Token (leave empty to keep current)
          </Label>
          <Input
            id="new_telegram_bot_token"
            name="telegram_bot_token"
            type="text"
            placeholder="Enter new bot token if you want to change it"
            disabled={isLoading}
            className="mt-1"
          />
        </div>
        <p className="text-muted-foreground text-sm">
          Your current Telegram bot token from @BotFather. Enter a new token above only if you want
          to change it.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <div className="text-sm text-green-800">{success}</div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
