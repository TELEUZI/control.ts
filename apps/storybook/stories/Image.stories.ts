import { OptimizedImage, type OptimizedImageProps } from '@control.ts/design-system';
import type { Meta, Story } from '@storybook/html';

const meta: Meta<OptimizedImageProps> = {
  title: 'Example/OptimizedImage',
  tags: ['autodocs'],
  render: (args) => {
    const image = OptimizedImage(args);
    return image.node;
  },
  argTypes: {
    src: { control: 'string' },
    width: { control: 'number' },
    height: { control: 'number' },
    laziness: {
      control: ['lazy', 'intersection', 'none'],
      default: 'lazy',
      description: 'specifies how image should load',
    },
  },
} satisfies Meta<OptimizedImageProps>;

export const Lazy: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/105741866?s=64&v=4',
    width: 100,
    height: 100,
    laziness: 'lazy',
  },
};

export default meta;
