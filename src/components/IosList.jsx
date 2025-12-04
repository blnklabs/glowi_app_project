import { Link, Toggle } from 'framework7-react';

// Chevron component for list items
function ListChevron() {
  return (
    <i className="f7-icons ios-list-chevron" style={{ fontSize: '14px' }}>chevron_right</i>
  );
}

// Section header above list groups
export function IosListHeader({ children }) {
  return (
    <div className="ios-list-section-header">
      {children}
    </div>
  );
}

// Footer text below list groups
export function IosListFooter({ children }) {
  return (
    <div className="ios-list-section-footer">
      {children}
    </div>
  );
}

// Container for a group of list items
export function IosListGroup({ children, header, footer }) {
  return (
    <div className="ios-list-group">
      {header && <IosListHeader>{header}</IosListHeader>}
      <div className="ios-list-card">
        {children}
      </div>
      {footer && <IosListFooter>{footer}</IosListFooter>}
    </div>
  );
}

// Individual list item
export function IosListItem({
  title,
  subtitle,
  value,
  link,
  onClick,
  toggle,
  toggleChecked,
  onToggleChange,
  destructive,
  children,
  icon,
  iconBgColor,
}) {
  const content = (
    <>
      {icon && (
        <div
          className="ios-list-item-icon"
          style={{ backgroundColor: iconBgColor || '#8E8E93' }}
        >
          {icon}
        </div>
      )}
      <div className="ios-list-item-left">
        <span className="ios-list-item-title">{title}</span>
        {subtitle && <span className="ios-list-item-subtitle">{subtitle}</span>}
      </div>
      <div className="ios-list-item-right">
        {value && <span className="ios-list-item-value">{value}</span>}
        {toggle && (
          <Toggle
            checked={toggleChecked}
            onToggleChange={onToggleChange}
          />
        )}
        {children}
        {link && <ListChevron />}
      </div>
    </>
  );

  const className = `ios-list-item${destructive ? ' ios-list-item-destructive' : ''}`;

  if (link) {
    return (
      <Link href={link} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} onClick={onClick}>
      {content}
    </div>
  );
}

// List item with input field
export function IosListItemInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readonly,
}) {
  return (
    <div className="ios-list-item">
      <div className="ios-list-item-left">
        <span className="ios-list-item-title">{label}</span>
      </div>
      <input
        type={type}
        className="ios-list-item-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readonly}
      />
    </div>
  );
}

// Centered footer link
export function IosListFooterLink({ children, onClick }) {
  return (
    <div className="ios-list-footer-link" onClick={onClick}>
      {children}
    </div>
  );
}
