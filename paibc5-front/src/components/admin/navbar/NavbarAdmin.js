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

const NavbarAdmin = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
    const toggle = () => setIsOpen(!isOpen);
    console.log(user);
    return (
        <Navbar color="light" light expand="md">
            <NavbarBrand href="/admin">Admin - Casino</NavbarBrand>
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
                                    <NavLink href="/admin/blackjack">Blackjack</NavLink>
                                </DropdownItem>
                                <DropdownItem>
                                    <NavLink href="/admin/roulette">Roulette</NavLink>
                                </DropdownItem>
                                <DropdownItem>
                                    <NavLink href="/admin/lotto">Lotto</NavLink>
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

export default NavbarAdmin;