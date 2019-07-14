/*
 * This file is part of React-SearchKit.
 * Copyright (C) 2018-2019 CERN.
 *
 * React-SearchKit is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import 'babel-polyfill';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import expect from 'expect';
import {
  RESULTS_FETCH_SUCCESS,
  RESULTS_LOADING,
  SET_QUERY_COMPONENT_INITIAL_STATE,
  SET_STATE_FROM_URL,
  SET_QUERY_STRING,
  SET_QUERY_SORT_BY,
  SET_QUERY_SORT_ORDER,
} from '@app/state/types';
import {
  setInitialState,
  onAppInitialized,
  updateQueryString,
  updateQuerySortBy,
  updateQuerySortOrder,
} from '@app/state/actions';
import { UrlQueryStringHandler } from '@app/api';

const config = {
  urlQueryStringHandler: new UrlQueryStringHandler(),
  searchApi: {
    search: query => ({
      aggregations: [],
      hits: [],
      total: 0,
    }),
  },
};
const middlewares = [thunk.withExtraArgument(config)];
const mockStore = configureMockStore(middlewares);

describe('test query actions', () => {
  let store;
  const initialState = {
    queryString: '',
    sortBy: null,
    sortOrder: null,
    page: null,
    size: null,
    aggregations: [],
    layout: null,
  };
  beforeEach(() => {
    store = mockStore({
      query: initialState,
    });
    store.clearActions();
  });

  it('fires a set initial state action', async () => {
    const initialState = { queryString: 'this is my message' };
    const expectedActions = [
      {
        type: SET_QUERY_COMPONENT_INITIAL_STATE,
        payload: initialState,
      },
    ];

    await store.dispatch(setInitialState(initialState));
    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedActions[0]);
  });

  it('initializes the app setting the query state from the url query string', async () => {
    const queryStringOnLoad = [
      'q=this is my message',
      'sort=bestmatch',
      'order=asc',
      'p=1',
      's=10',
      'unknown=invalid',
    ];
    // set the url query string
    window.history.pushState(
      {},
      'Test Title',
      `/test.html?${queryStringOnLoad.join('&')}`
    );

    const expectedQueryState = {
      ...initialState,
      queryString: 'this is my message',
      sortBy: 'bestmatch',
      sortOrder: 'asc',
      page: 1,
      size: 10,
    };
    const expectedActions = [
      {
        type: SET_STATE_FROM_URL,
        payload: expectedQueryState,
      },
    ];

    await store.dispatch(onAppInitialized(false));
    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedActions[0]);
  });

  it('executes a search after app init', async () => {
    // // set the url query string
    // window.history.pushState(
    //   {},
    //   'Test Title',
    //   `/test.html?${queryStringOnLoad.join('&')}`
    // );

    const expectedActions = [
      {
        type: SET_STATE_FROM_URL,
      },
      {
        type: RESULTS_LOADING,
      },
      {
        type: RESULTS_FETCH_SUCCESS,
      },
    ];

    await store.dispatch(onAppInitialized(true));
    const actions = store.getActions();

    expect(actions[0].type).toEqual(expectedActions[0].type);
    expect(actions[1].type).toEqual(expectedActions[1].type);
    expect(actions[2].type).toEqual(expectedActions[2].type);
  });

  it('updates the query state with a new query string', async () => {
    const newQueryString = 'this is my message';
    const expectedActions = [
      {
        type: SET_QUERY_STRING,
        payload: newQueryString,
      },
    ];

    await store.dispatch(updateQueryString(newQueryString));
    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedActions[0]);
  });

  it('updates the query state with a new sortBy value', async () => {
    const newSortBy = 'mostrecent';
    const expectedActions = [
      {
        type: SET_QUERY_SORT_BY,
        payload: newSortBy,
      },
    ];

    await store.dispatch(updateQuerySortBy(newSortBy));
    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedActions[0]);
  });

  it('updates the query state with a new sortOrder value', async () => {
    const newSortOrder = 'desc';
    const expectedActions = [
      {
        type: SET_QUERY_SORT_ORDER,
        payload: newSortOrder,
      },
    ];

    await store.dispatch(updateQuerySortOrder(newSortOrder));
    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedActions[0]);
  });
});