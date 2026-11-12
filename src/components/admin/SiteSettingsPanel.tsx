'use client';

import { useState } from 'react';
import { MenuEditor } from './MenuEditor';
import { ThemeEditor } from './ThemeEditor';

/** The "সেটিংস" screen: menus, and the look of the site. */
export function SiteSettingsPanel() {
  const [tab, setTab] = useState<'menu' | 'theme'>('menu');
  return (
    <div data-section="admin.settings">
      <div className="p-admin__tabs c-sitesettings__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'menu'} className={tab === 'menu' ? 'is-on' : ''} onClick={() => setTab('menu')}>মেনু</button>
        <button type="button" role="tab" aria-selected={tab === 'theme'} className={tab === 'theme' ? 'is-on' : ''} onClick={() => setTab('theme')}>রং ও ফন্ট</button>
      </div>
      {tab === 'menu' ? <MenuEditor /> : <ThemeEditor />}
    </div>
  );
}
