<script lang="ts">
  import { focusOutside } from '$lib/actions/focus-outside';
  import { shortcuts } from '$lib/actions/shortcut';
  import { generateId } from '$lib/utils/generate-id';
  import { Icon } from '@immich/ui';
  import { mdiStar, mdiStarOutline } from '@mdi/js';
  import { t } from 'svelte-i18n';

  export type Rating = 1 | 2 | 3 | 4 | 5 | null;

  interface Props {
    count?: number;
    rating: Rating;
    readOnly?: boolean;
    onRating: (rating: Rating) => void | undefined;
  }

  let { count = 5, rating, readOnly = false, onRating }: Props = $props();

  let ratingSelection = $derived(rating);
  let hoverRating: Rating = $state(null);
  let focusRating: Rating = $state(null);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let skipNextChange = false;

  const id = generateId();
  // Radios of all star ratings on the page would otherwise form a single group,
  // so interacting with one widget would reset every other one.
  const groupName = `stars-${id}`;

  const handleSelect = (newRating: Rating) => {
    if (readOnly) {
      return;
    }

    if (newRating === rating) {
      return;
    }

    onRating(newRating);
  };

  // Clicking the active star clears the rating. Without preventDefault the click
  // would also check the radio again, which re-sets the rating right after
  // clearing it and leaves the stars showing a value that is no longer set.
  const handleToggleOff = (event: MouseEvent, value: Rating) => {
    if (readOnly || value !== rating) {
      return;
    }

    event.preventDefault();
    clearTimeout(timeoutId);
    skipNextChange = true;
    setTimeout(() => (skipNextChange = false));

    onRating(null);
  };

  const setHoverRating = (value: Rating) => {
    if (readOnly) {
      return;
    }
    hoverRating = value;
  };

  const reset = () => {
    setHoverRating(null);
    focusRating = null;
  };

  const handleSelectDebounced = (value: Rating) => {
    if (skipNextChange) {
      skipNextChange = false;
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      handleSelect(value);
    }, 300);
  };
</script>

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<fieldset
  class="text-primary w-fit cursor-default"
  onmouseleave={() => setHoverRating(null)}
  use:focusOutside={{ onFocusOut: reset }}
  use:shortcuts={[
    { shortcut: { key: 'ArrowLeft' }, preventDefault: false, onShortcut: (event) => event.stopPropagation() },
    { shortcut: { key: 'ArrowRight' }, preventDefault: false, onShortcut: (event) => event.stopPropagation() },
  ]}
>
  <legend class="sr-only">{$t('rating')}</legend>
  <div class="flex flex-row" data-testid="star-container">
    {#each { length: count } as _, index (index)}
      {@const value = index + 1}
      {@const filled = hoverRating === null ? (ratingSelection || 0) >= value : hoverRating >= value}
      {@const starId = `${id}-${value}`}
      <!-- svelte-ignore a11y_mouse_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <label
        for={starId}
        class:cursor-pointer={!readOnly}
        class:ring-2={focusRating === value}
        onmouseover={() => setHoverRating(value as Rating)}
        tabindex={-1}
        data-testid="star"
      >
        <span class="sr-only">{$t('rating_count', { values: { count: value } })}</span>
        <Icon icon={filled ? mdiStar : mdiStarOutline} size="1.5em" aria-hidden />
      </label>
      <input
        type="radio"
        name={groupName}
        {value}
        id={starId}
        bind:group={ratingSelection}
        disabled={readOnly}
        onfocus={(event) => {
          // Only keyboard focus gets a visible ring — a mouse click should not
          // leave a marker behind on the star it hit.
          focusRating = event.currentTarget.matches(':focus-visible') ? (value as Rating) : null;
        }}
        onclick={(event) => handleToggleOff(event, value as Rating)}
        onchange={() => handleSelectDebounced(value as Rating)}
        class="sr-only"
      />
    {/each}
  </div>
</fieldset>
