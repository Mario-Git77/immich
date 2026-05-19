import StarRating from '$lib/elements/StarRating.svelte';
import { fireEvent, render } from '@testing-library/svelte';

describe('StarRating component', () => {
  it('renders correctly', () => {
    const component = render(StarRating, {
      count: 3,
      rating: 2,
      readOnly: false,
      onRating: vi.fn(),
    });
    const container = component.getByTestId('star-container') as HTMLImageElement;
    expect(container.className).toBe('flex flex-row');

    const radioButtons = component.getAllByRole('radio') as HTMLInputElement[];
    expect(radioButtons.length).toBe(3);
    const labels = component.getAllByTestId('star') as HTMLLabelElement[];
    expect(labels.length).toBe(3);
    const labelText = component.getAllByText('rating_count') as HTMLSpanElement[];
    expect(labelText.length).toBe(3);

    // No clear button — rating is cleared by clicking the active star again
    const clearButton = component.queryByRole('button');
    expect(clearButton).toBeNull();

    // Check the initial state
    expect(radioButtons[0].checked).toBe(false);
    expect(radioButtons[1].checked).toBe(true);
    expect(radioButtons[2].checked).toBe(false);

    // Check the radio button attributes
    for (const [index, radioButton] of radioButtons.entries()) {
      expect(radioButton.id).toBe(labels[index].htmlFor);
      expect(radioButton.name).toBe('stars');
      expect(radioButton.value).toBe((index + 1).toString());
      expect(radioButton.disabled).toBe(false);
      expect(radioButton.className).toBe('sr-only');
    }

    // Check the label attributes
    for (const label of labels) {
      expect(label.className).toBe('cursor-pointer');
      expect(label.tabIndex).toBe(-1);
    }
  });

  it('renders correctly with readOnly', () => {
    const component = render(StarRating, {
      count: 3,
      rating: 2,
      readOnly: true,
      onRating: vi.fn(),
    });
    const radioButtons = component.getAllByRole('radio') as HTMLInputElement[];
    expect(radioButtons.length).toBe(3);
    const labels = component.getAllByTestId('star') as HTMLLabelElement[];
    expect(labels.length).toBe(3);
    const clearButton = component.queryByRole('button');
    expect(clearButton).toBeNull();

    // Check the initial state
    expect(radioButtons[0].checked).toBe(false);
    expect(radioButtons[1].checked).toBe(true);
    expect(radioButtons[2].checked).toBe(false);

    // Check the radio button attributes
    for (const [index, radioButton] of radioButtons.entries()) {
      expect(radioButton.id).toBe(labels[index].htmlFor);
      expect(radioButton.disabled).toBe(true);
    }

    // Check the label attributes
    for (const label of labels) {
      expect(label.className).toBe('');
    }
  });

  it('calls onRating with null when clicking the currently selected star', async () => {
    const onRating = vi.fn();
    const component = render(StarRating, {
      count: 3,
      rating: 2,
      readOnly: false,
      onRating,
    });

    const labels = component.getAllByTestId('star') as HTMLLabelElement[];
    await fireEvent.click(labels[1]); // star 2 is currently selected

    expect(onRating).toHaveBeenCalledWith(null);
  });

  it('does not call onRating with null when clicking an unselected star', async () => {
    const onRating = vi.fn();
    const component = render(StarRating, {
      count: 3,
      rating: 2,
      readOnly: false,
      onRating,
    });

    const labels = component.getAllByTestId('star') as HTMLLabelElement[];
    await fireEvent.click(labels[0]); // star 1 is not selected

    expect(onRating).not.toHaveBeenCalledWith(null);
  });

  it('does not clear rating when readOnly and clicking the selected star', async () => {
    const onRating = vi.fn();
    const component = render(StarRating, {
      count: 3,
      rating: 2,
      readOnly: true,
      onRating,
    });

    const labels = component.getAllByTestId('star') as HTMLLabelElement[];
    await fireEvent.click(labels[1]); // star 2 is currently selected, but readOnly

    expect(onRating).not.toHaveBeenCalled();
  });
});
