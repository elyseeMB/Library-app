import { css } from 'lit';

export const uiStyles = css`
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    letter-spacing: -0.5px;
    color: var(--color-title, #23272e);
  }

  h2 {
    margin: 0 0 12px;
    font-size: 15px;
    color: var(--color-600, #5b616e);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font: inherit;
    font-weight: 500;
    line-height: 20px;
    padding: 8px 14px;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--button-primary, #7e5aff);
    color: var(--button-primary-color, #fff);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--button-primary-hover, #683ffc);
  }

  .btn-secondary {
    background: var(--button-secondary, #fff);
    color: var(--button-secondary-color, #4a505c);
    border-color: var(--separator, #e5e4e7);
  }
  .btn-secondary:hover:not(:disabled) {
    background: var(--button-secondary-hover, #f5f6f7);
  }

  .btn-danger {
    background: var(--button-danger, #ed406b);
    color: var(--button-danger-color, #fff);
  }
  .btn-danger:hover:not(:disabled) {
    background: var(--button-danger-hover, #d62a54);
  }

  .btn-ghost {
    background: transparent;
    color: var(--button-ghost-color, #4a505c);
  }
  .btn-ghost:hover:not(:disabled) {
    background: var(--button-ghost-hover, #edeff2);
  }

  .btn-sm {
    padding: 5px 10px;
    font-size: 13px;
  }

  .card {
    background: var(--card-bg, #fff);
    border: 1px solid var(--separator, #e5e4e7);
    border-radius: 10px;
    padding: 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  .table-wrap {
    background: var(--card-bg, #fff);
    border: 1px solid var(--separator, #e5e4e7);
    border-radius: 10px;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid var(--separator, #e5e4e7);
    font-size: 14px;
  }

  th {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--color-500, #6d7380);
    background: var(--off-white, #fafbfc);
  }

  tr:last-child td {
    border-bottom: none;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }

  .badge-success {
    color: var(--green-600, #0c6c29);
    background: var(--halo-green, #cdfada);
  }

  .badge-warning {
    color: var(--orange-600, #a34700);
    background: var(--halo-orange, #fbe5d3);
  }

  .badge-danger {
    color: var(--red-600, #b81f45);
    background: var(--halo-red, #fae3e9);
  }

  .badge-neutral {
    color: var(--color-600, #5b616e);
    background: var(--halo-gray, #edeff2);
  }

  .alert {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .alert-error {
    color: var(--red-600, #b81f45);
    background: var(--halo-red, #fae3e9);
    border: 1px solid var(--red-200, #f28ca6);
  }

  .alert-success {
    color: var(--green-600, #0c6c29);
    background: var(--halo-green, #cdfada);
    border: 1px solid var(--green-200, #81d69a);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .field label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-700, #4a505c);
  }

  input,
  select,
  textarea {
    font: inherit;
    padding: 8px 12px;
    border: 1px solid var(--gray-200, #c0c4cc);
    border-radius: 8px;
    background: var(--white, #fff);
    color: var(--color-900, #23272e);
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-neon, #683ffc);
    box-shadow: var(--input-focus, 0 0 0 4px #1f90ff66);
  }

  .error-text {
    margin: 0;
    color: var(--color-red, #d62a54);
    font-size: 13px;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    color: var(--color-500, #6d7380);
    font-size: 14px;
  }

  .empty {
    padding: 32px;
    text-align: center;
    color: var(--color-500, #6d7380);
    border: 1px dashed var(--gray-200, #c0c4cc);
    border-radius: 10px;
  }

  .muted {
    color: var(--color-500, #6d7380);
    font-size: 13px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .spacer {
    flex: 1;
  }
`;
