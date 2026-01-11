/**
 * AI Consultation Screen
 * AI-powered medical consultation interface
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getAIConsultation} from '../../services/api';
import {showMessage} from 'react-native-flash-message';

const AIConsultationScreen = ({navigation}) => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      showMessage({
        message: 'Validation Error',
        description: 'Please enter a question',
        type: 'warning',
      });
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await getAIConsultation(question, context);

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: response.answer,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Failed to get AI consultation',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <Icon name="psychology" size={40} color="#15803d" />
        <Text style={styles.headerTitle}>AI Medical Consultant</Text>
        <Text style={styles.headerSubtitle}>
          Ask medical questions and get AI-powered insights
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('LabScan')}>
          <Icon name="camera-alt" size={24} color="#15803d" />
          <Text style={styles.quickActionText}>Scan Lab Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() =>
            setQuestion('What are the treatment options for hypertension?')
          }>
          <Icon name="help-outline" size={24} color="#15803d" />
          <Text style={styles.quickActionText}>Sample Question</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="chat-bubble-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              Start a conversation with our AI consultant
            </Text>
            <Text style={styles.emptySubtext}>
              Ask about symptoms, treatments, or lab results
            </Text>
          </View>
        ) : (
          messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageCard,
                message.type === 'user'
                  ? styles.userMessage
                  : styles.aiMessage,
              ]}>
              <View style={styles.messageHeader}>
                <Icon
                  name={message.type === 'user' ? 'person' : 'smart-toy'}
                  size={20}
                  color={message.type === 'user' ? '#fff' : '#15803d'}
                />
                <Text
                  style={[
                    styles.messageAuthor,
                    message.type === 'user' && styles.userMessageAuthor,
                  ]}>
                  {message.type === 'user' ? 'You' : 'AI Consultant'}
                </Text>
              </View>
              <Text
                style={[
                  styles.messageText,
                  message.type === 'user' && styles.userMessageText,
                ]}>
                {message.text}
              </Text>
            </View>
          ))
        )}
        {loading && (
          <View style={[styles.messageCard, styles.aiMessage]}>
            <ActivityIndicator color="#15803d" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.contextInput}
          placeholder="Patient context (optional)"
          placeholderTextColor="#999"
          value={context}
          onChangeText={setContext}
          multiline
          numberOfLines={2}
        />

        <View style={styles.questionContainer}>
          <TextInput
            style={styles.questionInput}
            placeholder="Ask a medical question..."
            placeholderTextColor="#999"
            value={question}
            onChangeText={setQuestion}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleAskQuestion}
            disabled={loading}>
            <Icon name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
  },
  quickActionText: {
    fontSize: 12,
    color: '#15803d',
    marginLeft: 5,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#15803d',
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  aiMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
    marginLeft: 8,
  },
  userMessageAuthor: {
    color: '#fff',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 15,
  },
  contextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  questionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#87ceaa',
  },
});

export default AIConsultationScreen;
