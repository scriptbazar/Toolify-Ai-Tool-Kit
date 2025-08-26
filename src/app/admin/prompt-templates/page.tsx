import PromptTemplateManager from '@/app/ai-prompt-templates/PromptTemplateManager';

export default function AIPromptTemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Prompt Templates</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and customize the prompts used by the AI tools to tune their responses.
        </p>
      </header>
      <PromptTemplateManager />
    </div>
  );
}
