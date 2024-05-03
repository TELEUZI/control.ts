import { OptimizedImage, type OptimizedImageProps } from '@control.ts/design-system';
import type { Meta } from '@storybook/html';

const meta: Meta<OptimizedImageProps> = {
  title: 'example/OptimizedImage',
  tags: ['autodocs'],
  render: (args) => {
    const image = OptimizedImage(args);
    window.onresize = () => {
      console.log(image.node.currentSrc);
    };
    return image.node;
  },
  argTypes: {
    src: { control: 'string', description: 'specifies image src' },
    width: { control: 'number', description: 'specifies image width' },
    height: { control: 'number', description: 'specifies image height' },
    laziness: {
      control: { type: 'radio' },
      options: ['lazy', 'intersection', 'none'],
      description: 'specifies how image should load',
    },
    alt: { control: 'string', description: 'specifies image alt attribute' },
    placeholder: { control: 'text', description: 'specifies image alt' },
    blur: {
      control: 'number',
      description: 'specifies placeholder image blur amount, if set to zero than no blur effect is applied',
    },
    fill: {
      control: 'boolean',
      description: 'if set to true, then width and height are no longer required',
    },
  },
} satisfies Meta<OptimizedImageProps>;

export const Lazy = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/105741866?s=64&v=4',
    width: 100,
    height: 100,
    laziness: 'lazy',
  },
};

const base64Img = `data:image/gif;base64,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`;

export const Placeholder = {
  args: {
    width: 501.498,
    height: 334.332,
    alt: 'image',
    placeholder: base64Img,
    src: 'https://wallpaperaccess.com/full/16504.jpg',
  },
};

export const Fill = {
  args: {
    fill: true,
    src: 'https://avatars.githubusercontent.com/u/105741866?s=64&v=4',
  },
};

export const Srcset = {
  args: {
    src: 'duck.jpeg',
    srcset: '1300w, 1500w',
    sizes: '(max-width: 1300px): 1300w, (max-width): 1500w',
    alt: 'srcset test',
    fill: true,
  },
};

export default meta;
