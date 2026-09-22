type TrashIconProps = { className?: string; title?: string };

function TrashIcon({ className, title }: TrashIconProps) {
  return <svg className={className} viewBox="0 0 24 24" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
    <path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default TrashIcon;
