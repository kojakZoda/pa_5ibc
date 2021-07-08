import React from 'react';
import {
    Container,
} from 'reactstrap';

import NavbarAdmin from '../navbar/NavbarAdmin';

const LandingAdmin = () => {
    return (
        <div>
            <Container fluid>
                <NavbarAdmin />
            </Container>
        </div>
    )
}

export default LandingAdmin;