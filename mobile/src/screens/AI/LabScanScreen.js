/**
 * Lab Scan Screen
 * Scan and parse lab reports using camera
 */

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {performOCR, parseLabResults} from '../../services/api';
import {showMessage} from 'react-native-flash-message';

const LabScanScreen = () => {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [labResults, setLabResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('capture'); // capture, ocr, results

  const handleTakePhoto = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: false,
      cameraType: 'back',
    };

    try {
      const result = await launchCamera(options);

      if (result.didCancel) {
        return;
      }

      if (result.assets && result.assets[0]) {
        setImage(result.assets[0]);
        processImage(result.assets[0]);
      }
    } catch (error) {
      showMessage({
        message: 'Camera Error',
        description: 'Failed to open camera',
        type: 'danger',
      });
    }
  };

  const handleSelectImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        return;
      }

      if (result.assets && result.assets[0]) {
        setImage(result.assets[0]);
        processImage(result.assets[0]);
      }
    } catch (error) {
      showMessage({
        message: 'Image Error',
        description: 'Failed to select image',
        type: 'danger',
      });
    }
  };

  const processImage = async imageData => {
    setLoading(true);
    setStep('ocr');

    try {
      // Convert image to base64
      const base64Image = imageData.base64 || imageData.uri;

      // Perform OCR
      const ocrResponse = await performOCR(base64Image);

      if (ocrResponse.success) {
        setOcrText(ocrResponse.text);

        // Parse lab results
        const parseResponse = await parseLabResults(ocrResponse.text);

        if (parseResponse.success) {
          setLabResults(parseResponse.results);
          setStep('results');

          showMessage({
            message: 'Success',
            description: 'Lab report processed successfully',
            type: 'success',
          });
        }
      }
    } catch (error) {
      showMessage({
        message: 'Processing Error',
        description: error.message || 'Failed to process image',
        type: 'danger',
      });
      setStep('capture');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setOcrText('');
    setLabResults(null);
    setStep('capture');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#15803d" />
        <Text style={styles.loadingText}>Processing lab report...</Text>
        <Text style={styles.loadingSubtext}>
          Using AI to extract and analyze data
        </Text>
      </View>
    );
  }

  if (step === 'results' && labResults) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultsHeader}>
          <Icon name="check-circle" size={60} color="#15803d" />
          <Text style={styles.resultsTitle}>Lab Results Processed</Text>
        </View>

        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{uri: image.uri}} style={styles.imagePreview} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted Results</Text>
          {labResults.tests?.map((test, index) => (
            <View key={index} style={styles.testCard}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{test.name}</Text>
                {test.abnormal && (
                  <View style={styles.abnormalBadge}>
                    <Icon name="warning" size={16} color="#fff" />
                    <Text style={styles.abnormalText}>Abnormal</Text>
                  </View>
                )}
              </View>
              <View style={styles.testDetails}>
                <Text style={styles.testValue}>
                  Value: {test.value} {test.unit}
                </Text>
                <Text style={styles.testRange}>
                  Normal Range: {test.normalRange}
                </Text>
              </View>
            </View>
          )) || (
            <Text style={styles.emptyText}>No test results found</Text>
          )}
        </View>

        {labResults.aiInterpretation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Interpretation</Text>
            <Text style={styles.interpretationText}>
              {labResults.aiInterpretation}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Icon name="refresh" size={24} color="#fff" />
          <Text style={styles.resetButtonText}>Scan Another Report</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="camera-alt" size={60} color="#15803d" />
        <Text style={styles.title}>Scan Lab Report</Text>
        <Text style={styles.subtitle}>
          Take a photo or select an image of your lab report
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleTakePhoto}>
          <Icon name="camera-alt" size={40} color="#fff" />
          <Text style={styles.actionButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSelectImage}>
          <Icon name="photo-library" size={40} color="#fff" />
          <Text style={styles.actionButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <View style={styles.infoStep}>
          <Icon name="camera" size={20} color="#15803d" />
          <Text style={styles.infoStepText}>
            1. Capture or select a lab report image
          </Text>
        </View>
        <View style={styles.infoStep}>
          <Icon name="psychology" size={20} color="#15803d" />
          <Text style={styles.infoStepText}>
            2. AI extracts text using advanced OCR
          </Text>
        </View>
        <View style={styles.infoStep}>
          <Icon name="analytics" size={20} color="#15803d" />
          <Text style={styles.infoStepText}>
            3. Results are parsed and analyzed
          </Text>
        </View>
        <View style={styles.infoStep}>
          <Icon name="insights" size={20} color="#15803d" />
          <Text style={styles.infoStepText}>
            4. Get AI-powered interpretations
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonsContainer: {
    padding: 20,
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#15803d',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoStepText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  resultsHeader: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  imagePreviewContainer: {
    padding: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
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
    marginBottom: 15,
  },
  testCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  abnormalBadge: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  abnormalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  testDetails: {
    marginTop: 5,
  },
  testValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  testRange: {
    fontSize: 12,
    color: '#666',
  },
  interpretationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#15803d',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default LabScanScreen;
