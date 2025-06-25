import { useState } from 'react';
import { StyleSheet, ScrollView, Switch, Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AISettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    voiceMode: false,
    autoSave: true,
    darkMode: false,
    smartSuggestions: true,
  });

  const updateSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onToggle 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <ThemedView style={styles.settingItem}>
      <ThemedView style={styles.settingText}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText style={styles.settingDescription}>{description}</ThemedText>
      </ThemedView>
      <Switch value={value} onValueChange={onToggle} />
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          ⚙️ AI Settings
        </ThemedText>
        
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>General</ThemedText>
          
          <SettingItem
            title="Push Notifications"
            description="Get notified about AI responses and updates"
            value={settings.notifications}
            onToggle={() => updateSetting('notifications')}
          />
          
          <SettingItem
            title="Auto-save Conversations"
            description="Automatically save your chat history"
            value={settings.autoSave}
            onToggle={() => updateSetting('autoSave')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>AI Features</ThemedText>
          
          <SettingItem
            title="Voice Mode"
            description="Enable voice input and responses"
            value={settings.voiceMode}
            onToggle={() => updateSetting('voiceMode')}
          />
          
          <SettingItem
            title="Smart Suggestions"
            description="Get AI-powered conversation suggestions"
            value={settings.smartSuggestions}
            onToggle={() => updateSetting('smartSuggestions')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
          
          <SettingItem
            title="Dark Mode"
            description="Use dark theme for the AI interface"
            value={settings.darkMode}
            onToggle={() => updateSetting('darkMode')}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Version</ThemedText>
            <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>AI Model</ThemedText>
            <ThemedText style={styles.infoValue}>IntelliAI v2.0</ThemedText>
          </ThemedView>
        </ThemedView>

        <Pressable style={styles.resetButton}>
          <ThemedText style={styles.resetButtonText}>Reset to Defaults</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#007AFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
