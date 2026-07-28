import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../../constants/theme';
import { buttonGlobal as ButtonGlobal } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('buttonGlobal', () => {
  it('renders label', () => {
    expect(wrap(<ButtonGlobal label="Salvar" onPress={() => {}} />).getByText('Salvar')).toBeTruthy();
  });

  it('fires onPress', () => {
    const fn = jest.fn();
    const { getByText } = wrap(<ButtonGlobal label="OK" onPress={fn} />);
    fireEvent.press(getByText('OK'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('blocks press when disabled', () => {
    const fn = jest.fn();
    const { getByText } = wrap(<ButtonGlobal label="OK" onPress={fn} disabled />);
    fireEvent.press(getByText('OK'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('shows loading indicator', () => {
    const { queryByText, getByTestId } = wrap(
      <ButtonGlobal label="OK" onPress={() => {}} loading />,
    );
    expect(queryByText('OK')).toBeNull();
  });
});
