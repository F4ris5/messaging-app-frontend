// filepath: d:\Coding\message-app\frontend\src\Homepage\Homepage.js
import { Box, Button, Grid } from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
    const navigate = useNavigate();

    return (
        <div className="container">
            <div className='scrolling-background'>
                <Grid
                    container
                    spacing={2}
                    sx={{
                        height: '100vh',
                        width: '100vw',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{
                            width: '30vw',
                            height: '60vh',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundImage: 'linear-gradient(#080808, #212121)',
                            elevation: 10,
                            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                            padding: '20px',
                            borderRadius: '10px',
                            gap: '20px',
                        }}
                    >
                        <Box 
                            sx={{ 
                                fontSize: '2rem', marginBottom: '20px', color: 'white', fontFamily: 'Cal Sans, sans-serif' 
                            }}
                            >Black Box</Box>
                        <Box 
                            sx={{ 
                                color: 'white', fontFamily: 'Quicksand, sans-serif;' 
                                }}
                            >What's said here stays here</Box>
                        <Button onClick={() => navigate('/register')}
                            sx={{
                                backgroundColor: '#303030',
                                color: 'white',
                                borderRadius: '50px',
                                '&:hover': {
                                    backgroundColor: '#c0ca00',
                                    color: 'black',
                                },
                                padding: '10px 20px',
                            }}
                            >Register</Button>
                        <Button onClick={() => navigate('/login')}
                        sx={{
                            backgroundColor: '#303030',
                            color: 'white',
                            borderRadius: '50px',
                            '&:hover': {
                                backgroundColor: '#c0ca00',
                                color: 'black',
                            },
                            padding: '10px 20px',
                        }}
                        >Log in</Button>
                    </Grid>
                </Grid>
            </div>     
        </div>
    );
}

export default Homepage;