import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'
import HorizontalNavItems from 'src/navigation/horizontal'

// ** Component Import
// Uncomment the below line (according to the layout type) when using server-side menu
// import ServerSideVerticalNavItems from './components/vertical/ServerSideNavItems'
// import ServerSideHorizontalNavItems from './components/horizontal/ServerSideNavItems'

import VerticalAppBarContent from './components/vertical/AppBarContent'
import HorizontalAppBarContent from './components/horizontal/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Next Import
import Link from 'next/link'

// ** MUI Import
import { styled, useTheme } from '@mui/material/styles'

const UserLayout = ({ children, contentHeightFixed }) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()

  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()
  // const { menuItems: horizontalMenuItems } = ServerSideHorizontalNavItems()
  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/material-ui/react-use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  const LinkStyled = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  })

  const HeaderTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    lineHeight: 'normal',
    textTransform: 'uppercase',
    color: theme.palette.text.primary,
    transition: 'opacity .25s ease-in-out, margin .25s ease-in-out'
  }))

  const AppBrand = () => {
    return (
      <LinkStyled href='/'>
        <img src='/images/logo.png' alt='logo' width='30' height='30' />
        <HeaderTitle variant='h6' sx={{ ml: 4, mr: 4 }}>
          PIYUCHECKPOINT
        </HeaderTitle>
      </LinkStyled>
    )
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          branding: () => <AppBrand />,

          //lockedIcon: <Icon icon='mdi:chevron-left' />,
          //unlockedIcon: <Icon icon='mdi:chevron-right' />,
          navItems: VerticalNavItems()

          // Uncomment the below line when using server-side menu in vertical layout and comment the above line
          // navItems: verticalMenuItems
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
      footerProps={{
        content: () => `© ${new Date().getFullYear()} - PIYUCHECKPOINT`
      }}
      {...(settings.layout === 'horizontal' && {
        horizontalLayoutProps: {
          navMenu: {
            navItems: HorizontalNavItems()

            // Uncomment the below line when using server-side menu in horizontal layout and comment the above line
            // navItems: horizontalMenuItems
          },
          appBar: {
            content: () => <HorizontalAppBarContent settings={settings} saveSettings={saveSettings} />,
            branding: () => <AppBrand />
          }
        }
      })}
    >
      {children}
    </Layout>
  )
}

export default UserLayout
