import React, { useState, useEffect } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
import {
    Link
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const NavbarPlayer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
    const toggle = () => setIsOpen(!isOpen);
    return (
        <Navbar color="light" light expand="md">
            <NavbarBrand href="/">Player - Casino</NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
                <Nav className="mr-auto" navbar>
                    {
                        isAuthenticated &&
                        <UncontrolledDropdown nav inNavbar>
                            <DropdownToggle nav caret>
                                Games
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem>
                                    <NavLink href="/blackjack">Blackjack</NavLink>
                                </DropdownItem>
                                <DropdownItem>
                                    <NavLink href="/roulette">Roulette</NavLink>
                                </DropdownItem>
                                <DropdownItem>
                                    <NavLink href="/lotto">Lotto</NavLink>
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    }
                    <NavItem>
                        {isAuthenticated
                            ? <NavLink title="logout" tag={Link} to="#!" onClick={() => logout({ returnTo: window.location.origin })}>
                                Logout
                            </NavLink>
                            : <NavLink title="login" tag={Link} to="#!" onClick={() => loginWithRedirect({ redirectUri: window.location.origin + "/callback" })}>
                                Login | Register
                            </NavLink>
                        }
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    )
}

export default NavbarPlayer;