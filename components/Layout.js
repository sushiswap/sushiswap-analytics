import { Box, Container } from "@material-ui/core";

import AppBar from "./AppBar";
import AppFooter from "./AppFooter";
import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <AppBar />
      <Container maxWidth="lg">
        <Box my={4}>{children}</Box>
      </Container>
      <AppFooter />
    </>
  );
}
