export default function LogsReports() {
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Logs and Reports</h1>
        <p className="text-muted-foreground">Monitor system activity and generate reports</p>
      </div>

      {/* Log Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">File Audit Logs</h3>
              <p className="text-sm text-muted-foreground">Track file processing status</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            View File Logs
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Job Execution Logs</h3>
              <p className="text-sm text-muted-foreground">Monitor job performance</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            View Job Logs
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Mapping Validation</h3>
              <p className="text-sm text-muted-foreground">Check mapping errors</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-accent transition-colors">
            View Validations
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Row Validation Logs</h3>
              <p className="text-sm text-muted-foreground">Data quality issues</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-accent transition-colors">
            View Row Errors
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Load Error Logs</h3>
              <p className="text-sm text-muted-foreground">Loading failures</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-accent transition-colors">
            View Load Errors
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-soft border border-border p-6 hover:shadow-medium transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Transformation Logs</h3>
              <p className="text-sm text-muted-foreground">Data transformation status</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-accent transition-colors">
            View Transforms
          </button>
        </div>
      </div>
    </div>
  );
}
