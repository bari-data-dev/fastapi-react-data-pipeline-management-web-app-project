export default function PipelineManagement() {
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Pipeline Management</h1>
        <p className="text-muted-foreground">Monitor and manage your data pipelines</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg shadow-soft border border-border p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Pipelines</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-soft border border-border p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Successful Runs</p>
              <p className="text-2xl font-bold text-foreground">95%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-soft border border-border p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Run</p>
              <p className="text-2xl font-bold text-foreground">2h ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Actions */}
      <div className="bg-card rounded-lg shadow-soft border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Pipeline Actions</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Open Prefect UI</h3>
              <p className="text-sm text-muted-foreground">Monitor and manage your pipelines in Prefect</p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Open Prefect
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">View Pipeline Logs</h3>
              <p className="text-sm text-muted-foreground">Check execution logs and debugging information</p>
            </div>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-accent transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
