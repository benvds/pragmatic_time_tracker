import { MantineProvider } from "@mantine/core";

import { Logbook } from "@/features";

export const App = () => {
    return (
        <MantineProvider>
            <Logbook />
        </MantineProvider>
    );
};
