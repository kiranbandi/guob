import React from 'react'
import { AppBar, Toolbar, Stack, Typography, Box, IconButton, Link, CardMedia, Card } from '@mui/material'
import labLogo from "data/usask_p2irc_colour_reverse.png"
import uniLogo from "data/usask_usask_colour_reverse.png"

function Footer() {
    return (
        <>
            <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }} >
                <Toolbar>
                    <img src={uniLogo} height="40px" />
                    <Typography
                        variant="subtitle2"
                        component='div'
                        sx={{
                            ml: 2,
                            mr: 50,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 500,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}>
                        Developed by the Human Computer Interaction Lab at the University of Saskatchewan
                    </Typography>
                    <Box
                        sx={{ flexGrow: 1 }} />
                    <IconButton>
                    
                        <Link 
                        edge={'end'}
                        href="https://hci.usask.ca/index.php/recruitment/"
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                color: 'inherit'
                            }}>
                            <Typography
                                variant="h6"
                                color="inherit"
                                sx={{
                                    mr: 1,
                                }}
                            >
                                Contact Us:
                            </Typography>
                            <img
                                src={labLogo}
                                height="50px" />
                        </Link>
                    </IconButton>
                </Toolbar>
            </AppBar>
        </>
    )
}

export default Footer