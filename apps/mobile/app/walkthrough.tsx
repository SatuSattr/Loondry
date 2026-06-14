import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WalkthroughScreen() {
  const {
    activeSlide,
    setActiveSlide,
    colors,
    styles,
    isDark,
    toastMounted,
    hideToast,
    t,
  } = useAppContext();

  const slides = [
    {
      title: t('slide1Title'),
      desc: t('slide1Desc'),
      image: require('../assets/clean-laundry.jpg'),
    },
    {
      title: t('slide2Title'),
      desc: t('slide2Desc'),
      image: require('../assets/fragrant-laundry.jpg'),
    },
    {
      title: t('slide3Title'),
      desc: t('slide3Desc'),
      image: require('../assets/hygienic-laundry.jpg'),
    }
  ];

  const slide = slides[activeSlide];

  const handleCompleteOnboarding = async () => {
    try {
      await AsyncStorage.setItem('lnd_onboarded', 'true');
      router.replace('/login');
    } catch (e) {
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView
      style={[styles.walkthroughContainer, { backgroundColor: colors.background }]}
      onTouchStart={() => {
        if (toastMounted) {
          hideToast();
        }
      }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Skip button */}
      <TouchableOpacity 
        style={styles.skipBtn}
        onPress={handleCompleteOnboarding}
      >
        <Text style={styles.skipBtnText}>{t('skip')}</Text>
      </TouchableOpacity>

      {/* Content slide */}
      <View style={styles.walkthroughContent}>
        <Image 
          source={slide.image} 
          style={styles.walkthroughImage}
          resizeMode="cover"
        />
        
        <Text style={[styles.walkthroughTitle, { color: colors.foreground }]}>
          {slide.title}
        </Text>
        
        <Text style={[styles.walkthroughDesc, { color: colors.mutedForeground }]}>
          {slide.desc}
        </Text>
      </View>

      {/* Footer: Pagination dots and Next/Get Started button */}
      <View style={styles.walkthroughFooter}>
        {/* Dots Indicator */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.dot, 
                { backgroundColor: activeSlide === index ? colors.primary : colors.mutedForeground + '40' },
                activeSlide === index && { width: 20 }
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (activeSlide < slides.length - 1) {
              setActiveSlide(activeSlide + 1);
            } else {
              handleCompleteOnboarding();
            }
          }}
        >
          <Text style={[styles.nextBtnText, { color: colors.primaryForeground }]}>
            {activeSlide === slides.length - 1 ? t('startNow') : t('next')}
          </Text>
          <Ionicons 
            name={activeSlide === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'} 
            size={18} 
            color={colors.primaryForeground} 
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
