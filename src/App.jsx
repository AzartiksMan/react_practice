import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const getProducts = productsFromServer.map(product => {
  const category =
    categoriesFromServer.find(cat => cat.id === product.categoryId) || null;
  const user =
    usersFromServer.find(person => person.id === category.ownerId) || null;

  return {
    ...product,
    category,
    user,
  };
});

const TABLE_COLUMNS_TITLE = ['ID', 'Product', 'Category', 'User'];

const prepareVisibleProducts = (
  products,
  filterByUser,
  query,
  filterParams,
  sortDirection,
  columnToSort,
) => {
  let operation = [...products];
  const isSortDirectionDown = sortDirection === 'down';

  if (filterByUser !== null) {
    operation = operation.filter(product => product.user.id === filterByUser);
  }

  if (query !== '') {
    const normalizedQuary = query.toLowerCase().trim();

    operation = operation.filter(({ name }) => {
      return name.toLowerCase().includes(normalizedQuary);
    });
  }

  if (filterParams.length !== 0) {
    operation = operation.filter(({ category }) => {
      return filterParams.includes(category.title);
    });
  }

  if (sortDirection !== null && columnToSort !== null) {
    operation.sort((prod1, prod2) => {
      switch (columnToSort) {
        case 'ID':
          return prod1.id - prod2.id;

        case 'Product':
          return prod1.name.localeCompare(prod2.name);

        case 'Category':
          return prod1.category.title.localeCompare(prod2.category.title);

        case 'User':
          return prod1.user.name.localeCompare(prod2.user.name);

        default:
          return 0;
      }
    });

    if (isSortDirectionDown) {
      operation.reverse();
    }
  }

  return operation;
};

export const App = () => {
  const [filterByUser, setFilterByUser] = useState(null);
  const [query, setQuery] = useState('');
  const [filterParams, setFilterParams] = useState([]);

  const [sortDirection, setSortDirection] = useState(null);
  const [columnToSort, setColumnToSort] = useState(null);

  const handleSelectFilterParams = categoryTitle => {
    setFilterParams(currentParams => [...currentParams, categoryTitle]);
  };

  const handletUnselectFilterParams = categoryTitle => {
    setFilterParams(currentParams => {
      return currentParams.filter(title => title !== categoryTitle);
    });
  };

  const products = prepareVisibleProducts(
    getProducts,
    filterByUser,
    query,
    filterParams,
    sortDirection,
    columnToSort,
  );

  const isNotFilterParams = filterParams.length === 0;

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': filterByUser === null })}
                onClick={() => setFilterByUser(null)}
              >
                All
              </a>

              {usersFromServer.map(user => {
                const isUserSelected = filterByUser === user.id;

                return (
                  <a
                    key={user.id}
                    data-cy="FilterUser"
                    href="#/"
                    className={cn({ 'is-active': isUserSelected })}
                    onClick={() => setFilterByUser(user.id)}
                  >
                    {user.name}
                  </a>
                );
              })}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value.trimStart())}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query !== '' && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button', 'is-success', 'mr-6', {
                  'is-outlined': !isNotFilterParams,
                })}
                onClick={() => setFilterParams([])}
              >
                All
              </a>

              {categoriesFromServer.map(({ title }) => {
                const isFilterActive = filterParams.includes(title);

                return (
                  <a
                    key={title}
                    data-cy="Category"
                    href="#/"
                    className={cn('button', 'mr-2', 'my-1', {
                      'is-info': isFilterActive,
                    })}
                    onClick={
                      isFilterActive
                        ? () => handletUnselectFilterParams(title)
                        : () => handleSelectFilterParams(title)
                    }
                  >
                    {title}
                  </a>
                );
              })}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className={cn(
                  'button',
                  'is-link',
                  { 'is-outlined': false },
                  'is-fullwidth',
                )}
                onClick={() => {
                  setQuery('');
                  setFilterByUser(null);
                  setFilterParams([]);
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {products.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {TABLE_COLUMNS_TITLE.map(title => {
                    const isColumnSorted = columnToSort === title;
                    const isSortedUp = isColumnSorted && sortDirection === 'up';
                    const isSortedDown =
                      isColumnSorted && sortDirection === 'down';

                    return (
                      <th key={title}>
                        <span className="is-flex is-flex-wrap-nowrap">
                          {title}

                          <a
                            href="#/"
                            onClick={() => {
                              if (!isColumnSorted) {
                                setColumnToSort(title);
                                setSortDirection('up');
                              } else if (isSortedUp) {
                                setSortDirection('down');
                              } else {
                                setSortDirection(null);
                                setColumnToSort(null);
                              }
                            }}
                          >
                            <span className="icon">
                              <i
                                data-cy="SortIcon"
                                className={cn(
                                  'fas',
                                  { 'fa-sort': !isColumnSorted },
                                  { 'fa-sort-up': isSortedUp },
                                  { 'fa-sort-down': isSortedDown },
                                )}
                              />
                            </span>
                          </a>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {products.map(product => {
                  const isMale = product.user.sex === 'm';

                  return (
                    <tr data-cy="Product">
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {product.id}
                      </td>

                      <td data-cy="ProductName">{product.name}</td>
                      <td data-cy="ProductCategory">
                        {`${product.category.icon} - ${product.category.title}`}
                      </td>

                      <td
                        data-cy="ProductUser"
                        className={cn(
                          { 'has-text-link': isMale },
                          { 'has-text-danger': !isMale },
                        )}
                      >
                        {product.user.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
