/**
 * Add Patient Screen
 * Form to add new patient
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-picker/picker';
import {addPatient} from '../../services/api';
import {showMessage} from 'react-native-flash-message';

const AddPatientScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    contact: '',
    address: '',
    ward: '',
    diagnosis: '',
    treatment: '',
    allergies: '',
    status: 'stable',
    notes: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.age) {
      showMessage({
        message: 'Validation Error',
        description: 'Name and Age are required',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await addPatient(formData);
      if (response.success) {
        showMessage({
          message: 'Success',
          description: 'Patient added successfully',
          type: 'success',
        });
        navigation.goBack();
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.message,
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter patient name"
              value={formData.name}
              onChangeText={text => updateField('name', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={text => updateField('age', text)}
              />
            </View>

            <View style={[styles.inputContainer, {flex: 1}]}>
              <Text style={styles.label}>Gender</Text>
              <Picker
                selectedValue={formData.gender}
                style={styles.picker}
                onValueChange={value => updateField('gender', value)}>
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={formData.contact}
              onChangeText={text => updateField('contact', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter address"
              multiline
              numberOfLines={2}
              value={formData.address}
              onChangeText={text => updateField('address', text)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ward</Text>
            <TextInput
              style={styles.input}
              placeholder="Ward number/name"
              value={formData.ward}
              onChangeText={text => updateField('ward', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Diagnosis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Primary diagnosis"
              multiline
              numberOfLines={3}
              value={formData.diagnosis}
              onChangeText={text => updateField('diagnosis', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Treatment Plan</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Current treatment"
              multiline
              numberOfLines={3}
              value={formData.treatment}
              onChangeText={text => updateField('treatment', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={styles.input}
              placeholder="Known allergies"
              value={formData.allergies}
              onChangeText={text => updateField('allergies', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Status</Text>
            <Picker
              selectedValue={formData.status}
              style={styles.picker}
              onValueChange={value => updateField('status', value)}>
              <Picker.Item label="Stable" value="stable" />
              <Picker.Item label="Critical" value="critical" />
              <Picker.Item label="Improving" value="improving" />
              <Picker.Item label="Under Observation" value="observation" />
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional information"
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={text => updateField('notes', text)}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Add Patient</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#15803d',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#87ceaa',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AddPatientScreen;
