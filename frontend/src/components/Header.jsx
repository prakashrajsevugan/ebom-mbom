import { Icons } from './Icons';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-icon">
          <Icons.Cog />
        </div>
        <div>
          <div className="header-title">BOM Converter</div>
          <div className="header-subtitle">Engineering to Manufacturing</div>
        </div>
      </div>
    </header>
  );
}
