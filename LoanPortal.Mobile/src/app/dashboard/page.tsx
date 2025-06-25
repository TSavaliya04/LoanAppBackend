'use client'
import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  LinearProgress,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material'
import {
  Search,
  Info,
  Menu,
  Add,
  MonetizationOn,
  TrendingUp,
  Edit,
  CheckCircle,
  Timeline,
  Home,
  Description,
  CalendarToday,
  QuestionAnswer,
  Person,
  KeyboardArrowDown,
} from '@mui/icons-material'
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0)
  const [compensationMonth, setCompensationMonth] = useState('April')

  const actionButtons = [
    { 
      icon: <Add />, 
      label: 'Create/Send Pre-approval', 
      color: 'primary' as const 
    },
    { 
      icon: <MonetizationOn />, 
      label: 'Price Loan/ Pull Rates', 
      color: 'primary' as const 
    },
    { 
      icon: <TrendingUp />, 
      label: 'Start Loan', 
      color: 'primary' as const 
    },
    { 
      icon: <Edit />, 
      label: 'Edit Loan', 
      color: 'primary' as const 
    },
    { 
      icon: <CheckCircle />, 
      label: 'Check Status', 
      color: 'primary' as const 
    },
    { 
      icon: <Timeline />, 
      label: 'View Pipeline', 
      color: 'primary' as const 
    },
  ]

  const opportunities = [
    {
      name: 'Cody Fisher',
      type: 'FHA loan',
      agent: 'Salvador Preciado'
    },
    {
      name: 'Cody Fisher',
      type: 'FHA Loan',
      agent: 'Salvador'
    }
  ]

  return (
    <Box sx={{ bgcolor: 'secondary.main', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <AppBar 
        position="static" 
        sx={{ 
          position: 'fixed',
          top: 0,
          bgcolor: 'white', 
          boxShadow: 'none', 
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Image 
                width={32}
                height={32}
                src={'/icons/icon-192x192.png'}
                alt="Logo"  
              />
            </Box>
            <Typography  sx={{ color: 'text.primary', fontSize: '1.6rem', fontWeight: 400 }}>
              <Typography sx={{ display: 'inline-block', color: 'primary.main', fontSize: '1.6rem', fontWeight: 700 }}>Loans</Typography> N Stuff
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton sx={{ color: 'text.secondary' }}>
              <Search />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary' }}>
              <Info />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary' }}>
              <Menu />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              {/* Compensation Card */}
              <Paper sx={{ p: 3, borderRadius: '12px' }} elevation={0}>
                {/* Greeting */}
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                  Hi, Salvador
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ color: 'primary.main' }} />
                    <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Compensation
                    </Typography>
                  </Box>
                  <Button 
                    endIcon={<KeyboardArrowDown />}
                    sx={{ color: 'primary.main' }}
                    onClick={() => {
                      setCompensationMonth('')
                    }}
                  >
                    {compensationMonth}
                  </Button>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    mb: 2,
                    bgcolor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'error.main'
                    }
                  }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '20px', color: 'text.primary' }}>
                      $ 1,354,045
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      7 Loans funded
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '20px', color: 'text.primary' }}>
                      $ 1,723,485
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      10 loans est. funded
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {actionButtons.map((button, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
              <Button
                fullWidth
                variant="contained"
                color={button.color}
                startIcon={button.icon}
                sx={{
                  py: 2,
                  px: 2,
                  fontSize: '14px',
                  fontWeight: 400,
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'left',
                  boxShadow: 'none',
                }}
                onClick={() => {
                  console.log(`${button.label} clicked`)
                }}
              >
                {button.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Top Opportunities */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Top Opportunities
            </Typography>
            <Button 
              sx={{ color: 'primary.main' }}
              onClick={() => {
                router.push('/top-opportunities');
              }}
            >
              See all
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {opportunities.map((opp, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 4 }} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2, // 8px
                    borderColor: 'divider',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                      {opp.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                      {opp.type}
                    </Typography>

                    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1 }} />

                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                      Agent
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {opp.agent}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid #e5e7eb',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'error.main'
            }
          }
        }}
      >
        <BottomNavigationAction icon={<Home />} />
        <BottomNavigationAction icon={<Description />} />
        <BottomNavigationAction icon={<CalendarToday />} />
        <BottomNavigationAction icon={<QuestionAnswer />} />
        <BottomNavigationAction icon={<Person />} />
      </BottomNavigation>
    </Box>
  )
};

export default Dashboard;

// dashboard.protected = true;

// dashboard.getLayout = function getLayout(page: ReactElement) {
//   return (
//     <PageHeader title="Dashboard" BreadcrumbsComponent="" ActionComponent="">
//       {page}
//     </PageHeader>
//   );
// };
