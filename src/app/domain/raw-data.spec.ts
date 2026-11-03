import { Dataset, mergeRawData, RawData } from './raw-data';

function singleQueryResponse(name: string): RawData {
  const dataset = new Dataset();
  dataset.series.query.name = name;
  const response = new RawData();
  response.datasets = [dataset];
  return response;
}

describe('mergeRawData', () => {
  it('keeps one dataset per response, in the order of the responses', () => {
    const merged = mergeRawData([
      singleQueryResponse('Question6'),
      singleQueryResponse('Question14'),
      singleQueryResponse('Question10'),
    ]);

    expect(merged.datasets.map(dataset => dataset.series.query.name))
      .toEqual(['Question6', 'Question14', 'Question10']);
  });

  it('keeps the slot of an empty response so the other indexes do not shift', () => {
    const merged = mergeRawData([
      singleQueryResponse('Question6'),
      new RawData(),
      singleQueryResponse('Question10'),
    ]);

    expect(merged.datasets.length).toBe(3);
    expect(merged.datasets[1].series.result).toEqual([]);
    expect(merged.datasets[2].series.query.name).toBe('Question10');
  });

  it('returns no datasets for no responses', () => {
    expect(mergeRawData([]).datasets).toEqual([]);
  });
});
