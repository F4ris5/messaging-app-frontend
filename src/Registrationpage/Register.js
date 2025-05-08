import { Box, Button, Grid, TextField } from '@mui/material';
import * as React from 'react';
import './Register.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
function Register() {
    const navigate = useNavigate();
    const handleRegister = () => {
        const name = document.getElementById('name-input').value;
        const password = document.getElementById('password-input').value;

        fetch(`${process.env.REACT_APP_HOST}/addname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        console.log('User registered');
    };

    return (
        <div className="container">
            <div className='scrolling-background'>
                <Grid container spacing={2} 
                    sx={{ 
                        height: '100vh', 
                        width: '100vw', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        }}>
                    <Grid item xs={12} md={6} 
                        sx={{ 
                            width: '30vw',
                            height: '60vh',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'start', 
                            alignItems: 'center', 
                            backgroundColor: 'white', 
                            padding: '20px', 
                            borderRadius: '10px', 
                            gap: '20px' }}>
                        
                    <Box sx={{ alignSelf: 'flex-start', cursor: 'pointer' , height: '20%' }}>
                        <FontAwesomeIcon icon={faArrowLeft} onClick={() => navigate('/')} />
                    </Box>
                        <Box 
                        sx={{ 
                            fontSize: '2rem', 
                            marginBottom: '20px',
                            fontFamily: 'Quicksand, sans-serif',
                            }}>Register</Box>
                        <TextField id="name-input" label="Name" variant="outlined" fullWidth />
                        <TextField id="password-input" label="Password" type="password" variant="outlined" fullWidth />
                        <Button variant="contained" color="primary" onClick={handleRegister} 
                        sx={{
                            backgroundColor: '#303030',
                                color: 'white',
                                borderRadius: '50px',
                                '&:hover': {
                                    backgroundColor: '#c0ca00',
                                    color: 'black',
                                },
                                padding: '10px 20px',
                        }}>Confirm</Button>
                    </Grid>
                </Grid>
            </div>
        </div>
            
    );
}

export default Register;