import 'styled-components/native';
import { ITheme } from '../constants/theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends ITheme {}
}
