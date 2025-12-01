import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PastureBackground } from './PastureBackground';
import styles from './Layout.module.css';

function Layout() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <PastureBackground />
      <nav className={styles.nav}>
        <NavLink
          to="/pasture"
          className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
        >
          {t('common.appName')}
        </NavLink>
        <NavLink
          to="/stable"
          className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
        >
          {t('stable.title')}
        </NavLink>
        <NavLink
          to="/gambit"
          className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
        >
          {t('gambit.title')}
        </NavLink>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
