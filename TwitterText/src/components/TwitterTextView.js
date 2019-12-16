import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Linking,
  Platform,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  extractHashtags as shouldExtractHashtags,
  extractMentions as shouldExtractMentions,
} from 'twitter-text';
import { test as isHyperlink } from 'linkifyjs';

const styles = StyleSheet
  .create(
    {
      linkStyle: {
        color: '#2980b9',
      },
    },
  );

const sanitize = (str = '', extractHashtags = true, extractMentions = true) => str

const TwitterTextView = ({
  children = '',
  extractHashtags,
  onPressHashtag,
  hashtagStyle,
  extractMentions,
  onPressMention,
  mentionStyle,
  extractLinks,
  onPressLink,
  linkStyle,
  propStyle,
  ...extraProps
}) => {
  return (
    <Text
      {...extraProps}
    >
      {sanitize(
        children,
        extractHashtags,
        extractMentions,
      )
        .split(/(\s+)/) // split string by any whitespace
        .map(
          (word, i) => {
            if (extractLinks && isHyperlink(word)) {
              return (
                <Text
                  key={word + i}
                  onPress={e => onPressLink(e, word)}
                  style={linkStyle}
                >
                  {word}
                </Text>
              );
            }
            if ( /\?\w+/g.test(word)) {
              const [ prop ] = word.match(/\?\w+/g) || []
              if (prop) {
                const after = `${word.substring(prop.length + 1)}`;
                return (
                  <Text
                    key={word + i}
                  >
                    <Text
                      style={propStyle}
                    >
                      {prop}
                    </Text>
                    <Text
                    >
                      {`${after}`}
                    </Text>
                  </Text>
                );
              }
            }
            if (extractHashtags) {
              const [ hashtag ] = shouldExtractHashtags(
                word
              ) || [];
              if (hashtag) {
                const result = `#${hashtag}`;
                const after = `${word.substring(hashtag.length + 1)}`;
                return (
                  <Text
                    key={word + i}
                  >
                    <Text
                      onPress={e => onPressHashtag(e, hashtag)}
                      style={hashtagStyle}
                    >
                      {`${result}`}
                    </Text>
                    <Text
                    >
                      {`${after}`}
                    </Text>
                  </Text>
                );
              }
            }
            if (extractMentions) {
              const [ mention ] = shouldExtractMentions(
                word
              ) || [];
              if (mention) {
                const result = `@${mention}`;
                const after = `${word.substring(mention.length + 1)}`;
                return (
                  <Text
                    key={word + i}
                  >
                    <Text
                      onPress={e => onPressMention(e, mention)}
                      style={mentionStyle}
                    >
                      {`${result}`}
                    </Text>
                    <Text
                    >
                      {`${after}`}
                    </Text>
                  </Text>
                );
              }
            }
            return (
              <Text
                key={word + i}
              >
                {word}
              </Text>
            );
          },
        )}
    </Text>
  );
};

TwitterTextView.propTypes = {
  children: PropTypes.string,
  extractHashtags: PropTypes.bool,
  onPressHashtag: PropTypes.func,
  hashtagStyle: PropTypes.shape({}),
  extractMentions: PropTypes.bool,
  onPressMention: PropTypes.func,
  mentionStyle: PropTypes.shape({}),
  extractLinks: PropTypes.bool,
  onPressLink: PropTypes.func,
  linkStyle: PropTypes.shape({}),
  propStyle: PropTypes.shape({}),
};

TwitterTextView.defaultProps = {
  children: '',
  extractHashtags: true,
  onPressHashtag: (e, hashtag) => {
    const msg = `Hashtag: "${hashtag}"`;
    if (Platform.OS !== 'web') {
      Alert.alert(msg);
    } else {
      console.log(msg);
    }
  },
  hashtagStyle: styles.linkStyle,
  extractMentions: true,
  onPressMention: (e, mention) => {
    const msg = `Mention: "${mention}"`;
    if (Platform.OS !== 'web') {
      Alert.alert(msg);
    } else {
      console.log(msg);
    }
  },
  mentionStyle: styles.linkStyle,
  propStyle: styles.linkStyle,
  extractLinks: true,
  onPressLink: (e, url) => Linking.canOpenURL(url)
    .then(canOpen => (!!canOpen) && Linking.openURL(url)),
  linkStyle: styles.linkStyle,
};

export default memo(TwitterTextView);
