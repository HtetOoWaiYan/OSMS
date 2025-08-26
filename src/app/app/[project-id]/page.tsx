import { TelegramProvider } from '@/components/telegram-provider';
import MiniAppContent from './mini-app-content';

interface AppPageProps {
  params: Promise<{ 'project-id': string }>;
}

export default async function AppPage({ params }: AppPageProps) {
  const { 'project-id': projectId } = await params;

  return (
    <TelegramProvider projectId={projectId}>
      <MiniAppContent />
    </TelegramProvider>
  );
}
