import React, { Component } from 'react';
import useI18N from '../hooks/useI18N';

export default function withI18N(Component) {
  const WrappedComponent = (props) => {
    const { i18n, locale } = useI18N();
    return <Component {...props} i18n={i18n} locale={locale} />;
  };
  return WrappedComponent;
}
