import { Component, type ReactNode } from "react";
import { Alert, Button, Container, Paper, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component for catching and displaying storage errors
 *
 * Wraps components to catch errors during rendering, data fetching, and lifecycle methods.
 * Provides a fallback UI with error details and recovery options.
 */
export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details for debugging
        console.error("ErrorBoundary caught an error:", error, errorInfo);

        // Log to external service if available
        // logErrorToService(error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Default fallback UI
            return (
                <Container size="lg" py="xl">
                    <Paper shadow="md" p="xl">
                        <Stack gap="md">
                            <Alert
                                icon={<IconAlertCircle size={16} />}
                                title="Storage Error"
                                color="red"
                            >
                                <Text size="sm">
                                    An error occurred while accessing your time
                                    tracking data.
                                </Text>
                            </Alert>

                            <Stack gap="xs">
                                <Text size="sm" fw={500}>
                                    Error details:
                                </Text>
                                <Text size="sm" c="dimmed" ff="monospace">
                                    {this.state.error.message}
                                </Text>
                            </Stack>

                            <Stack gap="xs">
                                <Text size="sm" fw={500}>
                                    What you can try:
                                </Text>
                                <ul>
                                    <li>
                                        <Text size="sm">
                                            Refresh the page to retry
                                        </Text>
                                    </li>
                                    <li>
                                        <Text size="sm">
                                            Clear your browser data and try
                                            again
                                        </Text>
                                    </li>
                                    <li>
                                        <Text size="sm">
                                            Check browser console for more
                                            details
                                        </Text>
                                    </li>
                                </ul>
                            </Stack>

                            <Button onClick={this.resetError} variant="light">
                                Try Again
                            </Button>
                        </Stack>
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}
