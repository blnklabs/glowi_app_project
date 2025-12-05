import { Link, Icon } from 'framework7-react';
import { lightHaptic } from '../utils/despia.js';

/**
 * A back navigation link that triggers light haptic feedback when tapped.
 * Wraps Framework7's Link component with back navigation and haptic support.
 */
export default function HapticBackLink({ className = '', children, ...props }) {
  const handleClick = () => {
    lightHaptic();
  };

  return (
    <Link back className={`flex items-center ${className}`} onClick={handleClick} {...props}>
      {children || (
        <Icon f7="chevron_left" style={{ fontSize: '24px', position: 'relative', left: '-2px' }} />
      )}
    </Link>
  );
}

