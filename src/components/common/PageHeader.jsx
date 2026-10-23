export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action || children}
    </div>
  );
}
