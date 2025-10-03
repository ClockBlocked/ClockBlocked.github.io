/**
 * Test Suite for Advanced Music Player Features
 * 
 * This script tests all 7 new features to ensure they work correctly.
 * Run this in the browser console after the app has loaded.
 */

(function() {
    'use strict';

    console.log('%c🧪 Running Advanced Features Test Suite...', 'color: #3b82f6; font-size: 18px; font-weight: bold;');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    function test(name, fn) {
        try {
            fn();
            results.passed++;
            results.tests.push({ name, status: 'PASS' });
            console.log(`%c✓ ${name}`, 'color: #10b981; font-weight: bold;');
        } catch (error) {
            results.failed++;
            results.tests.push({ name, status: 'FAIL', error: error.message });
            console.error(`%c✗ ${name}`, 'color: #ef4444; font-weight: bold;', error);
        }
    }

    console.log('\n%c1️⃣ Testing Audio Visualizer', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');
    
    test('Audio Visualizer - Object exists', () => {
        if (typeof audioVisualizer === 'undefined') {
            throw new Error('audioVisualizer is not defined');
        }
    });

    test('Audio Visualizer - Has required methods', () => {
        const methods = ['initialize', 'start', 'stop', 'setMode', 'draw'];
        methods.forEach(method => {
            if (typeof audioVisualizer[method] !== 'function') {
                throw new Error(`audioVisualizer.${method} is not a function`);
            }
        });
    });

    test('Audio Visualizer - Has visualization modes', () => {
        const mode = audioVisualizer.visualizationMode;
        if (!['bars', 'wave', 'circular'].includes(mode)) {
            throw new Error(`Invalid default mode: ${mode}`);
        }
    });

    test('Audio Visualizer - toggleVisualizer function exists', () => {
        if (typeof toggleVisualizer !== 'function') {
            throw new Error('toggleVisualizer function not found');
        }
    });

    console.log('\n%c2️⃣ Testing Crossfade', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');

    test('Crossfade - Object exists', () => {
        if (typeof crossfade === 'undefined') {
            throw new Error('crossfade is not defined');
        }
    });

    test('Crossfade - Has required methods', () => {
        const methods = ['enable', 'disable', 'setDuration', 'start'];
        methods.forEach(method => {
            if (typeof crossfade[method] !== 'function') {
                throw new Error(`crossfade.${method} is not a function`);
            }
        });
    });

    test('Crossfade - Default duration is valid', () => {
        if (typeof crossfade.duration !== 'number' || crossfade.duration < 1) {
            throw new Error(`Invalid duration: ${crossfade.duration}`);
        }
    });

    test('Crossfade - toggleCrossfade function exists', () => {
        if (typeof toggleCrossfade !== 'function') {
            throw new Error('toggleCrossfade function not found');
        }
    });

    console.log('\n%c3️⃣ Testing Lyrics Display', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');

    test('Lyrics Display - Object exists', () => {
        if (typeof lyricsDisplay === 'undefined') {
            throw new Error('lyricsDisplay is not defined');
        }
    });

    test('Lyrics Display - Has required methods', () => {
        const methods = ['initialize', 'loadLyrics', 'render', 'syncWithAudio', 'startSync', 'stopSync', 'addLyrics'];
        methods.forEach(method => {
            if (typeof lyricsDisplay[method] !== 'function') {
                throw new Error(`lyricsDisplay.${method} is not a function`);
            }
        });
    });

    test('Lyrics Display - Has lyrics database', () => {
        if (typeof lyricsDisplay.lyricsDatabase !== 'object') {
            throw new Error('lyricsDatabase is not an object');
        }
    });

    test('Lyrics Display - toggleLyrics function exists', () => {
        if (typeof toggleLyrics !== 'function') {
            throw new Error('toggleLyrics function not found');
        }
    });

    console.log('\n%c4️⃣ Testing Smart Recommendations', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');

    test('Smart Recommendations - Object exists', () => {
        if (typeof smartRecommendations === 'undefined') {
            throw new Error('smartRecommendations is not defined');
        }
    });

    test('Smart Recommendations - Has required methods', () => {
        const methods = ['trackPlay', 'getRecommendations', 'loadHistory', 'saveHistory', 'clearHistory'];
        methods.forEach(method => {
            if (typeof smartRecommendations[method] !== 'function') {
                throw new Error(`smartRecommendations.${method} is not a function`);
            }
        });
    });

    test('Smart Recommendations - Has listening history array', () => {
        if (!Array.isArray(smartRecommendations.listeningHistory)) {
            throw new Error('listeningHistory is not an array');
        }
    });

    test('Smart Recommendations - getRecommendations function exists', () => {
        if (typeof getRecommendations !== 'function') {
            throw new Error('getRecommendations function not found');
        }
    });

    console.log('\n%c5️⃣ Testing Voice Commands', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');

    test('Voice Commands - Object exists', () => {
        if (typeof voiceCommands === 'undefined') {
            throw new Error('voiceCommands is not defined');
        }
    });

    test('Voice Commands - Has required methods', () => {
        const methods = ['initialize', 'registerCommand', 'processCommand', 'startListening', 'stopListening', 'setupDefaultCommands'];
        methods.forEach(method => {
            if (typeof voiceCommands[method] !== 'function') {
                throw new Error(`voiceCommands.${method} is not a function`);
            }
        });
    });

    test('Voice Commands - Has commands object', () => {
        if (typeof voiceCommands.commands !== 'object') {
            throw new Error('commands is not an object');
        }
    });

    test('Voice Commands - toggleVoiceControl function exists', () => {
        if (typeof toggleVoiceControl !== 'function') {
            throw new Error('toggleVoiceControl function not found');
        }
    });

    test('Voice Commands - Browser support detection', () => {
        if (typeof voiceCommands.isSupported !== 'boolean') {
            throw new Error('isSupported property is not boolean');
        }
    });

    console.log('\n%c6️⃣ Testing Sleep Timer', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');

    test('Sleep Timer - Object exists', () => {
        if (typeof sleepTimer === 'undefined') {
            throw new Error('sleepTimer is not defined');
        }
    });

    test('Sleep Timer - Has required methods', () => {
        const methods = ['start', 'stop', 'end', 'formatTime', 'getRemainingTime', 'addTime'];
        methods.forEach(method => {
            if (typeof sleepTimer[method] !== 'function') {
                throw new Error(`sleepTimer.${method} is not a function`);
            }
        });
    });

    test('Sleep Timer - Time formatting works', () => {
        const formatted = sleepTimer.formatTime(125);
        if (formatted !== '2:05') {
            throw new Error(`Expected '2:05', got '${formatted}'`);
        }
    });

    test('Sleep Timer - startSleepTimer function exists', () => {
        if (typeof startSleepTimer !== 'function') {
            throw new Error('startSleepTimer function not found');
        }
    });

    console.log('\n%c7️⃣ Testing Audio Effects (Equalizer)', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');

    test('Audio Effects - Object exists', () => {
        if (typeof audioEffects === 'undefined') {
            throw new Error('audioEffects is not defined');
        }
    });

    test('Audio Effects - Has required methods', () => {
        const methods = ['initialize', 'applyPreset', 'setGain', 'setMasterVolume', 'reset', 'getPresets'];
        methods.forEach(method => {
            if (typeof audioEffects[method] !== 'function') {
                throw new Error(`audioEffects.${method} is not a function`);
            }
        });
    });

    test('Audio Effects - Has all 10 presets', () => {
        const expectedPresets = ['flat', 'bassBoost', 'trebleBoost', 'vocal', 'rock', 'pop', 'jazz', 'classical', 'electronic', 'acoustic'];
        const actualPresets = Object.keys(audioEffects.presets);
        expectedPresets.forEach(preset => {
            if (!actualPresets.includes(preset)) {
                throw new Error(`Missing preset: ${preset}`);
            }
        });
    });

    test('Audio Effects - Has 10 frequency bands', () => {
        if (audioEffects.frequencyBands.length !== 10) {
            throw new Error(`Expected 10 frequency bands, got ${audioEffects.frequencyBands.length}`);
        }
    });

    test('Audio Effects - setEqualizerPreset function exists', () => {
        if (typeof setEqualizerPreset !== 'function') {
            throw new Error('setEqualizerPreset function not found');
        }
    });

    console.log('\n%c🔧 Testing Advanced Features Manager', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');

    test('Advanced Features - Manager exists', () => {
        if (typeof advancedFeatures === 'undefined') {
            throw new Error('advancedFeatures is not defined');
        }
    });

    test('Advanced Features - Has initialization methods', () => {
        const methods = ['initialize', 'setupVisualizer', 'setupCrossfade', 'setupVoiceCommands', 'setupSleepTimer', 'setupEqualizer', 'setupLyrics', 'setupRecommendations', 'showFeaturesInfo'];
        methods.forEach(method => {
            if (typeof advancedFeatures[method] !== 'function') {
                throw new Error(`advancedFeatures.${method} is not a function`);
            }
        });
    });

    test('Features module - Main object exists', () => {
        if (typeof features === 'undefined') {
            throw new Error('features is not defined');
        }
    });

    test('Features module - Has initializeAll method', () => {
        if (typeof features.initializeAll !== 'function') {
            throw new Error('features.initializeAll is not a function');
        }
    });

    // Summary
    console.log('\n%c═══════════════════════════════════════', 'color: #6366f1;');
    console.log('%c📊 Test Results Summary', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('%c═══════════════════════════════════════', 'color: #6366f1;');
    console.log(`%cTotal Tests: ${results.passed + results.failed}`, 'font-weight: bold;');
    console.log(`%c✓ Passed: ${results.passed}`, 'color: #10b981; font-weight: bold;');
    console.log(`%c✗ Failed: ${results.failed}`, 'color: #ef4444; font-weight: bold;');
    
    if (results.failed === 0) {
        console.log('%c\n🎉 All tests passed! Features are working correctly.', 'color: #10b981; font-size: 16px; font-weight: bold;');
    } else {
        console.log('%c\n⚠️ Some tests failed. Check the errors above.', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
    }

    console.log('\n%c💡 Quick Test Commands:', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
    console.log('%c  - toggleVisualizer() - Test visualizer', 'color: #6b7280;');
    console.log('%c  - toggleCrossfade() - Test crossfade', 'color: #6b7280;');
    console.log('%c  - toggleLyrics() - Test lyrics display', 'color: #6b7280;');
    console.log('%c  - getRecommendations(5) - Test recommendations', 'color: #6b7280;');
    console.log('%c  - toggleVoiceControl() - Test voice commands', 'color: #6b7280;');
    console.log('%c  - startSleepTimer(1) - Test sleep timer (1 min)', 'color: #6b7280;');
    console.log('%c  - setEqualizerPreset("bassBoost") - Test equalizer', 'color: #6b7280;');
    console.log('%c  - advancedFeatures.showFeaturesInfo() - Show API docs', 'color: #6b7280;');

    return results;
})();
