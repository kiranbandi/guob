import React from 'react'
import { AppBar, Toolbar, Stack, Typography, Box, IconButton, Link, CardMedia, Card } from '@mui/material'
import labLogo from "data/usask_p2irc_colour_reverse.png"
import uniLogo from "data/usask_usask_colour_reverse.png"

function Footer() {
    return (
        <>
            <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }} >
                <Toolbar>
                    <Typography variant="h6" component='div' sx={{ flexGrow: 1 }}>
                    Developed by the Human Computer Interaction Lab at the University of Saskatchewan<img src={uniLogo} height="50px"></img>
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton edge={'end'} href="https://hci.usask.ca/index.php/recruitment/">
                        <Link variant="h6" color="inherit" >
                            Contact Us: 
                            <img src={labLogo} height="50px"></img>
                        </Link>
                    </IconButton>
                </Toolbar>
            </AppBar>
        </>
    )
}

export default Footer