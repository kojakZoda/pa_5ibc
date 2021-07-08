import React from 'react';
import {
    Container,
} from 'reactstrap';

import NavbarPlayer from '../navbar/NavbarPlayer';

const Landing = () => {
    return (
        <div>
            <Container fluid>
                <NavbarPlayer/>
            </Container>
        </div>
    )
}

export default Landing;