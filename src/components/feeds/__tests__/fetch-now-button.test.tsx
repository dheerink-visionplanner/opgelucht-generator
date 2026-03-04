import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FetchNowButton } from "../fetch-now-button";

function mockFetchSuccess(summary = {
  totalParsed: 10,
  totalNew: 3,
  totalDuplicates: 7,
  feedsWithErrors: 0,
}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, summary }),
  });
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ success: false, error: "Server error" }),
  });
}

function mockNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("FetchNowButton", () => {
  test("renders with 'Nu ophalen' label", () => {
    render(<FetchNowButton />);

    expect(
      screen.getByRole("button", { name: /nu ophalen/i }),
    ).toBeInTheDocument();
  });

  test("shows spinner and 'Bezig met ophalen...' during fetch", async () => {
    let resolveResponse!: (value: unknown) => void;
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<FetchNowButton />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    expect(
      screen.getByRole("button", { name: /bezig met ophalen/i }),
    ).toBeDisabled();
    expect(screen.getByText(/bezig met ophalen/i)).toBeInTheDocument();

    // Resolve to clean up
    resolveResponse({
      ok: true,
      json: async () => ({ success: true, summary: { totalParsed: 0, totalNew: 0, totalDuplicates: 0, feedsWithErrors: 0 } }),
    });
  });

  test("shows new item count on success", async () => {
    mockFetchSuccess({ totalParsed: 10, totalNew: 3, totalDuplicates: 7, feedsWithErrors: 0 });

    const user = userEvent.setup();
    render(<FetchNowButton />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    await waitFor(() => {
      expect(screen.getByText(/3 nieuwe items opgehaald/)).toBeInTheDocument();
    });
  });

  test("shows 'Geen nieuwe items gevonden' when 0 new", async () => {
    mockFetchSuccess({ totalParsed: 5, totalNew: 0, totalDuplicates: 5, feedsWithErrors: 0 });

    const user = userEvent.setup();
    render(<FetchNowButton />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/geen nieuwe items gevonden/i),
      ).toBeInTheDocument();
    });
  });

  test("shows error message on failure", async () => {
    mockFetchError();

    const user = userEvent.setup();
    render(<FetchNowButton />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/fout bij het ophalen van feeds/i),
      ).toBeInTheDocument();
    });
  });

  test("shows warning for partial failures", async () => {
    mockFetchSuccess({ totalParsed: 10, totalNew: 5, totalDuplicates: 5, feedsWithErrors: 2 });

    const user = userEvent.setup();
    render(<FetchNowButton />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    await waitFor(() => {
      expect(screen.getByText(/5 nieuwe items opgehaald/)).toBeInTheDocument();
      expect(screen.getByText(/2 feed\(s\) mislukt/)).toBeInTheDocument();
    });
  });

  test("calls onFetchComplete after success", async () => {
    mockFetchSuccess();

    const onFetchComplete = vi.fn();
    const user = userEvent.setup();
    render(<FetchNowButton onFetchComplete={onFetchComplete} />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    await waitFor(() => {
      expect(onFetchComplete).toHaveBeenCalledOnce();
    });
  });

  test("button re-enabled after fetch completes", async () => {
    mockFetchSuccess();

    const user = userEvent.setup();
    render(<FetchNowButton />);

    const button = screen.getByRole("button", { name: /nu ophalen/i });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /nu ophalen/i }),
      ).toBeEnabled();
    });
  });

  test("prevents double-click during loading", async () => {
    let resolveResponse!: (value: unknown) => void;
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<FetchNowButton />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    // Button should be disabled during loading
    const loadingButton = screen.getByRole("button", { name: /bezig met ophalen/i });
    expect(loadingButton).toBeDisabled();

    // fetch should have been called only once
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Resolve to clean up
    resolveResponse({
      ok: true,
      json: async () => ({ success: true, summary: { totalParsed: 0, totalNew: 0, totalDuplicates: 0, feedsWithErrors: 0 } }),
    });
  });

  test("shows error message on network failure", async () => {
    mockNetworkError();

    const user = userEvent.setup();
    render(<FetchNowButton />);

    await user.click(screen.getByRole("button", { name: /nu ophalen/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/fout bij het ophalen van feeds/i),
      ).toBeInTheDocument();
    });
  });
});
