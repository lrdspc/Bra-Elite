import { Button } from '@/components/ui/button';
import { DownloadIcon } from '@radix-ui/react-icons';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallButton() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  // Não mostra o botão se o app já estiver instalado ou se não puder ser instalado
  if (isInstalled || !canInstall) return null;

  const handleInstallClick = async () => {
    await promptInstall();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleInstallClick}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 shadow-lg"
    >
      <DownloadIcon className="h-4 w-4" />
      Instalar App
    </Button>
  );
}
