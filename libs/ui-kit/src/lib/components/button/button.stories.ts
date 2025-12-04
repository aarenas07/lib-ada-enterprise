import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button';

// Configuración General
const meta: Meta<ButtonComponent> = {
  title: 'Atomos/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  args: {
    label: 'Button',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'elevated', 'filled', 'outlined', 'icon'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    icon: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<ButtonComponent>;

// --- VARIANTES DE ESTILO ---

export const Text: Story = {
  args: {
    variant: 'text',
    label: 'Text Button',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    label: 'Elevated Button',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Filled Button',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    label: 'Outlined Button',
  },
};

export const IconButton: Story = {
  args: {
    variant: 'icon',
    icon: 'favorite',
  },
};

// --- VARIANTES DE TAMAÑO ---

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Pequeño',
    variant: 'filled',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    label: 'Mediano',
    variant: 'filled',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Grande',
    variant: 'filled',
    icon: 'rocket_launch',
  },
};

// --- ESTADOS ESPECIALES ---

export const WithIcon: Story = {
  args: {
    variant: 'filled',
    label: 'Con Icono',
    icon: 'send',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    label: 'Procesando...',
    variant: 'filled',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Deshabilitado',
    variant: 'filled',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    label: 'Ancho Completo',
    variant: 'filled',
  },
  parameters: {
    layout: 'padded',
  }
};