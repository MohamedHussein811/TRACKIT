import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log the error to a service like Sentry or your own backend
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // You could send this error to your backend or a service like Sentry
    // sendErrorToService(error, errorInfo);
  }

  handleRestart = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Navigate back to the home screen
    router.replace('/');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={64} color={Colors.status.error} style={styles.icon} />
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but an unexpected error occurred. Please try again.
            </Text>
            
            <ScrollView style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
              {this.state.errorInfo && (
                <Text style={styles.errorStack}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
            
            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <RefreshCw size={20} color={Colors.neutral.white} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Restart App</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.neutral.gray,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.status.error,
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;