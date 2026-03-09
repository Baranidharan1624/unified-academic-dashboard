function PageContainer({ children, title }) {
  return (
    <div className="page-container">
      {title && <h1 className="page-title">{title}</h1>}
      {children}
    </div>
  );
}

export default PageContainer;
